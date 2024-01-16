Generate workspace:

```bash
npx create-nx-workspace my-bank
```

Follow this configuration:

- Which stack do you want to use? · angular
- Integrated monorepo, or standalone project? · standalone
- Which bundler would you like to use? · esbuild
- Default stylesheet format · scss
- Do you want to enable Server-Side Rendering (SSR) and Static Site Generation (SSG/Prerendering)? · No
- Test runner to use for end to end (E2E) tests · none
- Enable distributed caching to make your CI faster · No

You can optionally setup VS Code configuration:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit"
  },
  "editor.tabSize": 2,
  "typescript.inlayHints.enumMemberValues.enabled": true,
  "typescript.inlayHints.parameterTypes.enabled": true,
  "typescript.inlayHints.propertyDeclarationTypes.enabled": true,
  "typescript.inlayHints.variableTypes.enabled": true,
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true
}
```

Install Prettier v3.1.0

```bash
npm i -S prettier@3.1.0
```

Install Angular Material

```bash
npm i -S @angular/cdk @angular/material
```

You can manually configure Angular Material or you can use this command:

```bash
npx nx generate @angular/material:install
```

Add the `mat-app-background` class to the <body> tag inside the index.html file.

You can manually configure TailwindCSS or you can use this command:

```bash
npx nx generate @nx/angular:setup-tailwind
```

Style the header slightly.

Add the icons (shyft and usdc)
