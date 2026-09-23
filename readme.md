# Snapmy.site

Paste a product URL and get a beat-synced launch film with motion design, sound, and export-ready formats.

## Run locally

Serve this folder with any static web server. The browser-side fallback reads public pages through the configured reader service and uses the built-in director when the production API is unavailable.

## Production API

The frontend calls same-origin `/api` routes when a backend is deployed. Keep provider keys on that server and never commit them to this repository.
