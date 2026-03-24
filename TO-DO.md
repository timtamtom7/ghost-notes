# Ghost Notes — Human Tasks

The app is fully built and runnable. Complete these items to ship:

---

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable **Authentication** → Sign-in method → **Email link (magic link)**
3. Enable **Firestore Database** → Create database (start in test mode, then add security rules)
4. Copy your Firebase project credentials into `src/firebase.js`:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

## Firestore Security Rules

Apply these rules in the Firebase Console under Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /saves/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /lists/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Deployment

1. Run `npm run build` in `/Users/mauriello/Dev/ghost-notes`
2. Deploy the `dist/` folder to your hosting provider (Vercel, Netlify, Firebase Hosting, etc.)
3. Add your deployment URL to Firebase Authentication → Authorized domains

## Custom Domain (optional)

- Point your domain (e.g. `ghostnotes.app`) to your host
- Update Firebase Authorized Domains with the custom domain

## Logo & Brand

- Design a logo / brand mark for Ghost Notes (the ghost-eye motif is a placeholder)
- Favicon: already inline in `index.html` — replace with your final design

## Phase 2+ Items (not in MVP)

- Browser bookmarklet (drag-to-bookmarks)
- Browser extension (Manifest V3, `Cmd+Shift+G`)
- iOS Share Extension
- Weekly email haul (requires email service — Supabase Edge Function + Resend, or Firebase Extensions)
- Named lists UI
- Reading progress indicator
- Search in archive (already scaffolded)
- Stats page
- Article reading mode parser (Mercury Parser API or Postlight — see `src/pages/Reading.jsx`)
