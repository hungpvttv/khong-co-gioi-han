/**
 * Public, read-only page-view endpoint for the KHÔNG CÓ GIỚI HẠN website.
 *
 * Reads GA4 screenPageViews through the Analytics Data advanced service.
 * The public response contains only the aggregate count and update timestamp.
 * No OAuth token, GA credentials, or visitor-level data is exposed.
 *
 * Configure Script Properties:
 *   GA4_PROPERTY_ID = 16389959185
 *   GA4_START_DATE  = 2026-11-22
 *
 * Deploy as a Web App, executing as the owner, accessible to anyone.
 */

const CACHE_KEY = 'ga4_public_page_views_v1';
const CACHE_SECONDS = 900; // 15 minutes

function doGet(e) {
  const params = (e && e.parameter) || {};
  const callback = String(params.callback || '');

  // Restrict JSONP to a simple JavaScript identifier to prevent injection.
  if (callback && !/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)) {
    return output_({ ok: false, error: 'invalid_callback' }, '');
  }

  try {
    const cache = CacheService.getScriptCache();
    let payload = cache.get(CACHE_KEY);

    if (!payload) {
      payload = JSON.stringify(readPageViews_());
      cache.put(CACHE_KEY, payload, CACHE_SECONDS);
    }

    return output_(JSON.parse(payload), callback);
  } catch (error) {
    console.error('GA4 page-view counter failed: ' + error);
    return output_({
      ok: false,
      error: 'analytics_unavailable',
      message: 'Dữ liệu lượt xem hiện chưa sẵn sàng.'
    }, callback);
  }
}

function readPageViews_() {
  const properties = PropertiesService.getScriptProperties();
  const propertyId = properties.getProperty('GA4_PROPERTY_ID');
  const startDate = properties.getProperty('GA4_START_DATE');

  if (!propertyId || !/^\d+$/.test(propertyId)) {
    throw new Error('Missing or invalid GA4_PROPERTY_ID script property.');
  }
  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new Error('Missing or invalid GA4_START_DATE script property.');
  }

  const request = {
    dateRanges: [{ startDate: startDate, endDate: 'today' }],
    metrics: [{ name: 'screenPageViews' }]
  };

  const report = AnalyticsData.Properties.runReport(
    request,
    'properties/' + propertyId
  );

  const views = report.rows && report.rows.length
    ? Number(report.rows[0].metricValues[0].value)
    : 0;

  return {
    ok: true,
    metric: 'screenPageViews',
    views: Number.isFinite(views) ? views : 0,
    startDate: startDate,
    updatedAt: new Date().toISOString()
  };
}

function output_(data, callback) {
  const json = JSON.stringify(data);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run once from the Apps Script editor to verify that the GA4 property
 * is accessible and the configured date range returns a report.
 */
function testGa4Connection() {
  const result = readPageViews_();
  console.log(JSON.stringify(result));
  return result;
}
