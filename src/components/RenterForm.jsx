import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { X } from 'lucide-react'

const EMPTY = {
  flat_no: '', name: '', age: '', aadhaar: '', pan: '',
  contact: '', security_deposit: '', monthly_rent: '', lease_start_date: '', notes: ''
}

export default function RenterForm({ renter, onClose, onSaved }) {
  const isEdit = !!renter
  const [form, setForm] = useState(renter ? {
    flat_no: renter.flat_no || '',
    name: renter.name || '',
    age: renter.age || '',
    aadhaar: renter.aadhaar || '',
    pan: renter.pan || '',
    contact: renter.contact || '',
    security_deposit: renter.security_deposit || '',
    monthly_rent: renter.monthly_rent || '',
    lease_start_date: renter.lease_start_date || '',
    notes: renter.notes || ''
  } : { ...EMPTY })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.flat_no.trim() || !form.name.trim()) {
      setError('Flat number and name are required.')
      return
    }
    setLoading(true)
    setError('')
    const payload = {
      flat_no: form.flat_no.trim(),
      name: form.name.trim(),
      age: form.age ? parseInt(form.age) : null,
      aadhaar: form.aadhaar.trim() || null,
      pan: form.pan.trim().toUpperCase() || null,
      contact: form.contact.trim() || null,
      security_deposit: form.security_deposit ? parseFloat(form.security_deposit) : 0,
      monthly_rent: form.monthly_rent ? parseFloat(form.monthly_rent) : 0,
      lease_start_date: form.lease_start_date || null,
      notes: form.notes.trim() || null,
    }

    let err
    if (isEdit) {
      ({ error: err } = await supabase.from('renters').update(payload).eq('id', renter.id))
    } else {
      ({ error: err } = await supabase.from('renters').insert(payload))
    }

    if (err) { setError(err.message); setLoading(false); return }
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Renter' : 'Add Renter'}</h2>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="grid-2">
            <div className="form-group">
              <label>Flat No. *</label>
              <input placeholder="e.g. A-101" value={form.flat_no} onChange={e => set('flat_no', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Name *</label>
              <input placeholder="Full name" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Age</label>
              <input type="number" placeholder="Age" value={form.age} onChange={e => set('age', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Contact</label>
              <input placeholder="Phone number" value={form.contact} onChange={e => set('contact', e.target.value)} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Monthly Rent (₹)</label>
              <input type="number" placeholder="e.g. 8000" value={form.monthly_rent} onChange={e => set('monthly_rent', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Security Deposit (₹)</label>
              <input type="number" placeholder="e.g. 16000" value={form.security_deposit} onChange={e => set('security_deposit', e.target.value)} />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Aadhaar No.</label>
              <input placeholder="12-digit number" maxLength={12} value={form.aadhaar} onChange={e => set('aadhaar', e.target.value)} />
            </div>
            <div className="form-group">
              <label>PAN</label>
              <input placeholder="e.g. ABCDE1234F" maxLength={10} value={form.pan} onChange={e => set('pan', e.target.value.toUpperCase())} />
            </div>
          </div>

          <div className="form-group">
            <label>Lease Start Date</label>
            <input type="date" value={form.lease_start_date} onChange={e => set('lease_start_date', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea rows={2} placeholder="Any additional notes…" value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Renter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
