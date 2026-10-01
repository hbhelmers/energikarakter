async function request(path, options) {
  const res = await fetch(path, options)
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    // FastAPI validation errors come as { detail: [{ msg, loc }] }
    const detail = Array.isArray(body?.detail) ? body.detail.map((d) => d.msg).join(', ') : body?.detail
    throw new Error(detail || `Noe gikk galt (${res.status})`)
  }
  return body
}

export function getOptions() {
  return request('/api/options')
}

export function predict(bolig) {
  return request('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bolig),
  })
}
