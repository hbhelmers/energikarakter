import { useEffect, useState } from 'react'
import { getOptions, predict } from './api'
import './App.css'

const GRADES = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

const EMPTY_FORM = {
  bygningskategori: '',
  byggeaar: '',
  materialvalg: '',
  fylke: '',
}

function Select({ label, name, value, onChange, options, optional }) {
  return (
    <label>
      {label}
      <select name={name} value={value} onChange={onChange} required={!optional}>
        <option value="">{optional ? 'Vet ikke' : 'Velg …'}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function Result({ result }) {
  return (
    <section className="result" aria-live="polite">
      <p>Estimert energikarakter</p>
      <div className={`grade grade-${result.karakter}`}>{result.karakter}</div>
      <ol className="scale">
        {GRADES.map((g) => (
          <li key={g} className={`grade-${g} ${g === result.karakter ? 'active' : ''}`}>
            {g}
          </li>
        ))}
      </ol>
      <p className="note">
        Modellen gjetter riktig bokstav for omtrent halvparten av boligene, og bommer med mer enn én karakter bare
        for 1 av 20. Den kjenner ikke til isolasjon, vinduer eller oppussing, så se på dette som et grovt anslag.
      </p>
    </section>
  )
}

export default function App() {
  const [options, setOptions] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getOptions()
      .then(setOptions)
      .catch(() => setError('Får ikke kontakt med backend. Kjører den på port 8000?'))
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setResult(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // Empty optional fields are sent as null, so the model treats them as unknown
      const bolig = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? null : v]))
      bolig.byggeaar = Number(form.byggeaar)
      setResult(await predict(bolig))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <h1>Hva er energikarakteren til boligen din?</h1>
      <p className="intro">
        Fyll inn det du vet om boligen, så anslår en maskinlæringsmodell energikarakteren (A–G). Modellen er trent på
        over en million energiattester fra Enova.
      </p>

      {options && (
        <form onSubmit={handleSubmit}>
          <Select
            label="Boligtype"
            name="bygningskategori"
            value={form.bygningskategori}
            onChange={handleChange}
            options={options.bygningskategori}
          />
          <label>
            Byggeår
            <input
              type="number"
              name="byggeaar"
              value={form.byggeaar}
              onChange={handleChange}
              min={options.byggeaar.min}
              max={options.byggeaar.max}
              placeholder="f.eks. 1985"
              required
            />
          </label>
          <Select
            label="Fylke"
            name="fylke"
            value={form.fylke}
            onChange={handleChange}
            options={options.fylke}
            optional
          />
          <Select
            label="Byggemateriale"
            name="materialvalg"
            value={form.materialvalg}
            onChange={handleChange}
            options={options.materialvalg}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Beregner …' : 'Beregn energikarakter'}
          </button>
        </form>
      )}

      {error && <p className="error">{error}</p>}
      {result && <Result result={result} />}
    </main>
  )
}
