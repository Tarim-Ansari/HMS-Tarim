# MediCore HMS - Merged Frontend

This project merges the richer `frontend` UI with the reusable CRUD behavior from `frontend-check`.

## API
- Existing API endpoint paths were preserved.
- `src/api/client.js` remains the centralized JWT/API layer.
- `src/api/service.js` contains the domain API methods from both versions.
- `src/api/services.js` is a compatibility re-export to prevent older imports from breaking.

## Patient / Doctor management
- Patient and Doctor pages now use the reusable CRUD resource layer.
- Search and refresh work through the existing list API.
- Add/Edit/Delete use the existing create/update/delete API methods.
- Deactivate/Activate uses the existing PATCH endpoint with `is_active` and does not introduce a new endpoint.
- Edit, Deactivate/Activate and Delete actions are visible only to `SUPER_USER`, `SUPER_ADMIN`, and `HOSPITAL_ADMIN`.
- Other roles can still use the page according to the existing route permissions and can create where enabled.

## Other fixes
- Added the Nurses route from the existing source files.
- Fixed the Nurses import to use `api/service.js`.
- Header logout now calls the existing backend logout API before clearing the Redux/local session.
- Full-access role handling is normalized for SUPER_USER, SUPER_ADMIN and HOSPITAL_ADMIN.

## Run
```bash
npm install
npm run dev
```

Production build:
```bash
npm run build
```
