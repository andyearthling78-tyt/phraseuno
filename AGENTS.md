This is an Expo / React Native app (SDK 58, Expo Router). Mobile-first, iOS and Android.

## Rules
- Expo changes every SDK release. Before touching an Expo, EAS or React Native API, check the installed package's type definitions in `node_modules` or the versioned docs (`https://docs.expo.dev/versions/v58.0.0/`). Do not answer from memory.
- Add packages with `npx expo install <package>`. `ios/` and `android/` are generated; never edit them by hand. Native configuration belongs in `app.json` and config plugins. A new native module needs a new native build.
- `src/domain` and `src/content` are pure TypeScript without React or native imports, import each other with the `.ts` extension and use only erasable syntax, so `node --test` can run them directly. Keep it that way.
- Do not remove the two `postinstall` patches (`scripts/`). One forces on-device speech recognition on iOS (privacy), the other exposes the voice gender. Both abort on unknown library sources; re-check them on every package update.
- Audio plays only on a user action. Never start speech automatically.
- UI rules apply app-wide: keyboards close on scroll, destructive actions are red, the UI stays in the PhraseUNO look (green, cream, yellow) with little text.
- Learner data must survive updates: change `src/domain/progress.ts` only with a migration and a test.
- Run `npm test`, `npm run typecheck` and `npm run lint` before calling a task done.
