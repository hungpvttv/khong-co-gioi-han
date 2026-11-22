# GA4 page-view counter – KHÔNG CÓ GIỚI HẠN

This Google Apps Script exposes only the aggregate GA4 page-view count for the public website. It does not collect visits itself and does not expose credentials or visitor-level data.

## Configuration

Create a standalone Apps Script project at https://script.google.com/ and add the contents of `Code.gs`. In **Project Settings**, enable **Show "appsscript.json" manifest file in editor**, then replace the manifest with the repository's `appsscript.json`.

In **Project Settings → Script properties**, add:

| Property | Value |
|---|---|
| `GA4_PROPERTY_ID` | `16389959185` |
| `GA4_START_DATE` | `2026-11-22` |

The GA4 property ID is the numeric property ID shown in the user's GA4 web-stream details. The start date is the date GA4 collection was first verified for this website; change it if the property's first reporting day is different.

## Enable the Analytics Data service

In Apps Script, open **Services (+)** and add **Google Analytics Data API** (service identifier `AnalyticsData`, version `v1`). The manifest in this folder declares the same advanced service.

The script uses the GA4 metric `screenPageViews`, which corresponds to page and screen views. It queries from the configured start date through `today`.

## Test and authorize

1. Save the project.
2. Select `testGa4Connection` in the function selector and click **Run**.
3. Review the execution log. The first run asks the owner to authorize read-only Google Analytics access.
4. If the API is not enabled in the linked Google Cloud project, enable **Google Analytics Data API** for that project and run the test again.

The Google account running the script must have at least Viewer access to GA4 property `16389959185`.

## Deploy as a public Web App

1. Click **Deploy → New deployment**.
2. Select **Web app**.
3. Description: `Public GA4 page-view counter`.
4. Execute as: **Me** (the account that has GA4 access).
5. Who has access: **Anyone** (public, including visitors who are not signed in).
6. Click **Deploy**, authorize if prompted, and copy the URL ending in `/exec`.

The public endpoint is read-only and returns only the aggregate count. A 15-minute Apps Script cache prevents every page load from creating a new Analytics Data API report request.

## Test the deployed endpoint

Open the deployed URL in a browser. It should return JSON similar to:

```json
{
  "ok": true,
  "metric": "screenPageViews",
  "views": 22,
  "startDate": "2026-11-22",
  "updatedAt": "2026-11-22T..."
}
```

The number above is an example only. To test JSONP for the website integration, append:

```
?callback=handleGa4PageViews
```

The response should begin with `handleGa4PageViews({ ... });`.

Do not publish OAuth tokens, API keys, or other credentials in the website repository. The final `/exec` URL is a public read-only endpoint and may be placed in the website's public JavaScript configuration.

## Important behavior

- GA4 reporting data is not guaranteed to be real-time. The displayed count is the latest total returned by GA4, not necessarily including the last few minutes.
- The count starts at the configured date. It cannot reconstruct visits from before GA4 tracking was installed.
- The endpoint caches successful results for 15 minutes.
- If GA4 returns no rows for the selected period, the endpoint returns zero. If the API fails, it returns `ok: false`; the website should show a neutral placeholder rather than falsely displaying zero.
