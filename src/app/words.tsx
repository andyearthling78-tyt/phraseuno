import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Text } from '../components/localized-text';
import { Button, Card, Label, Page, s, Speak } from '../components/ui';
import { useLearning } from '../lib/store';
import { weekStatus } from '../lib/course';

export default function Words() {
  const { state, lesson, course, reviewWord } = useLearning();
  const [scope, setScope] = useState<'day' | 'week'>('day');
  const [practice, setPractice] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [cursor, setCursor] = useState(0);
  const status = weekStatus(course);
  const entries = scope === 'week' ? status.vocabulary : lesson.words.map((word, index) => ({ word, sources: [{day: lesson.id, index}], known: state.known.includes(index) }));
  const pending = entries.filter(entry => !entry.known);
  const current = (pending.length ? pending : entries)[cursor % (pending.length || entries.length || 1)];
  const canSave = !!current && current.sources.every(source => course.days[String(source.day)]?.chat === 4);
  return <Page>
    <View><Label>DEINE WORTSAMMLUNG</Label><Text style={[s.title, { marginTop: 10 }]}>Deine Wörter wachsen mit dir.</Text><Text style={s.subtitle}>Freiwillig am Tag. Gemeinsam zum Wochenabschluss.</Text></View>
    <View style={s.row}>
      <View style={{flex:1}}><Button secondary={scope !== 'day'} onPress={() => { setScope('day'); setPractice(false); setCursor(0); }}>Dieser Lerntag</Button></View>
      <View style={{flex:1}}><Button secondary={scope !== 'week'} onPress={() => { setScope('week'); setPractice(false); setCursor(0); }}>Diese Woche</Button></View>
    </View>
    {scope === 'week' && <Card>
      <Text style={s.h2}>Dein Wochenabschluss</Text>
      <Text style={s.body}>{status.completedDays} / 7 <Text>Lerntage geschafft</Text></Text>
      <Text style={s.body}>{status.vocabulary.length - status.remaining} / {status.vocabulary.length} <Text>gesammelte Wörter geübt</Text></Text>
      <Text style={s.small}>{status.readyForNextWeek ? 'Woche 1 geschafft! Alle Wochenwörter sind geübt. Weitere Lernwochen folgen.' : 'Die nächste Lernwoche wird erst freigegeben, wenn alle sieben Lerntage und ihre gesammelten Vokabeln geübt sind.'}</Text>
    </Card>}
    {!entries.length && <Card><Text style={s.body}>Nach deinem ersten erfolgreichen Lerntag sammeln sich hier automatisch die Vokabeln der Woche.</Text></Card>}
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
      {!canSave && <Text style={s.small}>Du kannst schon üben. Für den Wochenabschluss zählt das Wort nach dem erfolgreichen Lerntag.</Text>}
      {pending.length === 0 && canSave && <Text style={s.body}>Alle Wörter in dieser Auswahl sind geübt. Du kannst sie jederzeit wiederholen.</Text>}
    </Card> : entries.map(entry => <Card key={entry.word.es}>
      <View style={s.row}><Text style={{fontSize:36}}>{entry.word.symbol}</Text><View style={{flex:1}}><Text style={s.h2}>{entry.word.es}</Text><Text style={s.subtitle}>{entry.word.de} · {entry.known ? '✓ gefestigt' : 'noch in Übung'}</Text></View><Speak text={entry.word.es}/></View><Text style={s.small}>{entry.word.example}</Text>
    </Card>)}
    <Button secondary onPress={() => router.replace('/')}>Zum Lerntag →</Button>
  </Page>;
}
