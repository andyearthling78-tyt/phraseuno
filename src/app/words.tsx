import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '../components/localized-text';
import { Button, Card, Label, Page, s, Speak } from '../components/ui';
import { useLearning } from '../lib/store';
import { weekStatus } from '../lib/course';

export default function Words() {
  const { state, lesson, course, reviewWord, finishWeekReview } = useLearning();
  const params = useLocalSearchParams<{ review?: string }>();
  const [scope, setScope] = useState<'day' | 'week'>(params.review === 'week' ? 'week' : 'day');
  const [queue, setQueue] = useState<string[] | null>(() => {
    const start = weekStatus(course);
    return params.review === 'week' && start.reviewOpen ? start.vocabulary.map(entry => entry.word.es) : null;
  });
  const [queueFlipped, setQueueFlipped] = useState(false);
  const [practice, setPractice] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [cursor, setCursor] = useState(0);
  const status = weekStatus(course);
  const entries = scope === 'week' ? status.vocabulary : lesson.words.map((word, index) => ({ word, sources: [{day: lesson.id, index}], known: state.known.includes(index) }));
  const pending = entries.filter(entry => !entry.known);
  const current = (pending.length ? pending : entries)[cursor % (pending.length || entries.length || 1)];
  const canSave = !!current && current.sources.every(source => course.days[String(source.day)]?.chat === 4);
  function startWeekReview() { setQueue(status.vocabulary.map(entry => entry.word.es)); setQueueFlipped(false); setPractice(false); }
  function answerWeek(known: boolean) {
    if (!queue?.length) return;
    const [head, ...rest] = queue;
    reviewWord(head, known);
    const next = known ? rest : [...rest, head];
    setQueue(next); setQueueFlipped(false);
    if (next.length === 0) finishWeekReview();
  }
  if (queue) {
    const total = status.vocabulary.length;
    const entry = status.vocabulary.find(item => item.word.es === queue[0]);
    return <Page>
      <View><Label>WOCHENABFRAGE</Label><Text style={[s.title, { marginTop: 10 }]}>Alle Wörter dieser Woche.</Text><Text style={s.subtitle}>Unsichere Wörter kommen am Ende noch einmal.</Text></View>
      {entry ? <Card>
        <Text style={s.small}>{total - queue.length} / {total} <Text>sicher gewusst</Text></Text>
        <Text style={[s.title, s.center]}>{entry.word.symbol}</Text>
        <Text translate={false} style={[s.title, s.center]}>{entry.word.es}</Text><Speak text={entry.word.es} />
        <Text style={[s.small, s.center]}>Was heißt das? Erst laut antworten, dann aufdecken.</Text>
        {queueFlipped ? <>
          <Text style={[s.h2, s.center]}>{entry.word.de}</Text><Text style={s.body}>{entry.word.example}</Text>
          <Button onPress={() => answerWeek(true)}>Gewusst ✓</Button>
          <Button secondary onPress={() => answerWeek(false)}>Noch einmal üben ↻</Button>
        </> : <Button secondary onPress={() => setQueueFlipped(true)}>Bedeutung aufdecken</Button>}
      </Card> : <Card>
        <Text style={s.h2}>Woche geschafft! ✨</Text>
        <Text style={s.body}>Du hast alle Wörter der Woche abgefragt und gewusst. Die nächste Lernwoche ist freigegeben, sobald sie verfügbar ist.</Text>
      </Card>}
      <Button secondary onPress={() => setQueue(null)}>{entry ? 'Abfrage unterbrechen' : 'Zur Wortsammlung'}</Button>
    </Page>;
  }
  return <Page>
    <Text style={s.title}>Meine Wörter</Text>
    <View style={s.row}>
      <View style={{flex:1}}><Button secondary={scope !== 'day'} onPress={() => { setScope('day'); setPractice(false); setCursor(0); }}>Dieser Lerntag</Button></View>
      <View style={{flex:1}}><Button secondary={scope !== 'week'} onPress={() => { setScope('week'); setPractice(false); setCursor(0); }}>Diese Woche</Button></View>
    </View>
    {scope === 'week' && <Card>
      <Text style={s.body}>{status.vocabulary.length - status.remaining} / {status.vocabulary.length} <Text>Wörter sicher</Text> · {status.completedDays} / 7 <Text>Tage</Text></Text>
      {!status.reviewOpen && <Text style={s.small}>Wochenabfrage nach Tag 7.</Text>}
      {status.reviewOpen && <Button accent onPress={startWeekReview}>{status.readyForNextWeek ? 'Wochenabfrage wiederholen ↻' : 'Wochenabfrage starten →'}</Button>}
    </Card>}
    {!entries.length && <Card><Text style={s.body}>Nach deinem ersten Lerntag erscheinen hier deine Wörter.</Text></Card>}
    {!!entries.length && <Button onPress={() => { setPractice(value => !value); setFlipped(false); setCursor(0); }}>{practice ? 'Zur Wortliste' : 'Vokabeln üben →'}</Button>}
    {practice && current ? <Card>
      <Text style={s.small}>{pending.length} <Text>Wörter noch offen</Text></Text>
      <Text style={[s.title, s.center]}>{current.word.symbol}</Text>
      <Text style={[s.title, s.center]}>{current.word.es}</Text><Speak text={current.word.es} />
      <Text style={[s.small,s.center]}>Erst laut erinnern, dann die Bedeutung aufdecken.</Text>
      {flipped ? <><Text style={[s.h2,s.center]}>{current.word.de}</Text><Text style={s.body}>{current.word.note}</Text><Text style={s.body}>{current.word.example}</Text>
        <Button onPress={() => { if (canSave) reviewWord(current.word.es,true); setFlipped(false); setCursor(value => value + (canSave && pending.length ? 0 : 1)); }}>Gewusst ✓</Button>
        <Button secondary onPress={() => { if (canSave) reviewWord(current.word.es,false); setFlipped(false); setCursor(value => value+1); }}>Noch einmal üben ↻</Button>
      </> : <Button secondary onPress={() => setFlipped(true)}>Bedeutung aufdecken</Button>}

      {pending.length === 0 && canSave && <Text style={s.body}>Alle Wörter in dieser Auswahl sind geübt. Du kannst sie jederzeit wiederholen.</Text>}
    </Card> : entries.map(entry => <Card key={entry.word.es}>
      <View style={s.row}><Text style={{fontSize:36}}>{entry.word.symbol}</Text><View style={{flex:1}}><Text style={s.h2}>{entry.word.es}</Text><Text style={s.subtitle}>{entry.word.de} · {entry.known ? '✓ gefestigt' : 'noch in Übung'}</Text></View><Speak text={entry.word.es}/></View><Text style={s.small}>{entry.word.example}</Text>
    </Card>)}
  </Page>;
}
