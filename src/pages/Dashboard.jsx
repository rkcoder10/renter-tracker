import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, ChevronRight, CheckCircle2, XCircle, Clock, IndianRupee } from 'lucide-react'
import RenterForm from '../components/RenterForm'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Dashboard() {
  const navigate = useNavigate()
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [renters, setRenters] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchData()
  }, [currentMonth, currentYear])

  async function fetchData() {
    setLoading(true)
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from('renters').select('*').eq('is_active', true).order('flat_no'),
      supabase.from('payments').select('*').eq('month', currentMonth).eq('year', currentYear)
    ])
    setRenters(r || [])
    setPayments(p || [])
    setLoading(false)
  }

  function getPayment(renterId) {
    return payments.find(p => p.renter_id === renterId)
  }

  const totalRent = renters.reduce((s, r) => s + (r.monthly_rent || 0), 0)
  const totalCollected = payments.filter(p => p.is_paid).reduce((s, p) => s + (p.amount_received || 0), 0)
  const paidCount = renters.filter(r => getPayment(r.id)?.is_paid).length

  function changeMonth(dir) {
    let m = currentMonth + dir
    let y = currentYear
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    setCurrentMonth(m)
    setCurrentYear(y)
  }

  const isCurrentMonth = currentMonth === now.getMonth() + 1 && currentYear === now.getFullYear()

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22 }}>Dashboard</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>{renters.length} active flats</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
          <Plus size={15} /> Add Renter
        </button>
      </div>

      {/* Month selector */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '12px 16px',
        marginBottom: 20, justifyContent: 'center'
      }}>
        <button className="btn btn-ghost btn-sm" onClick={() => changeMonth(-1)} style={{padding:'6px 10px'}}>‹</button>
        <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, minWidth: 120, textAlign: 'center' }}>
          {MONTHS[currentMonth - 1]} {currentYear}
          {isCurrentMonth && <span style={{ color: 'var(--accent)', fontSize: 11, marginLeft: 6 }}>● Now</span>}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={() => changeMonth(1)} style={{padding:'6px 10px'}}>›</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Collected</div>
          <div style={{ fontSize: 20, fontFamily: 'Syne', fontWeight: 700, color: 'var(--green)' }}>
            ₹{totalCollected.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Expected</div>
          <div style={{ fontSize: 20, fontFamily: 'Syne', fontWeight: 700 }}>
            ₹{totalRent.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Paid</div>
          <div style={{ fontSize: 20, fontFamily: 'Syne', fontWeight: 700 }}>
            {paidCount}<span style={{ color: 'var(--text3)', fontSize: 14 }}>/{renters.length}</span>
          </div>
        </div>
      </div>

      {/* Renters list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>Loading…</div>
      ) : renters.length === 0 ? (
        <div className="empty-state">
          <h3>No renters yet</h3>
          <p>Add your first renter to get started</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>
            <Plus size={15} /> Add Renter
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {renters.map(renter => {
            const payment = getPayment(renter.id)
            const isPaid = payment?.is_paid
            const isPending = payment && !payment.is_paid
            return (
              <div
                key={renter.id}
                className="card"
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer', transition: 'border-color 0.15s',
                  borderLeft: `3px solid ${isPaid ? 'var(--green)' : 'var(--border)'}`
                }}
                onClick={() => navigate(`/renter/${renter.id}`)}
                onMouseEnter={e => e.currentTarget.style.borderColor = isPaid ? 'var(--green)' : 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = isPaid ? 'var(--green)' : 'var(--border)'}
              >
                {/* Flat badge */}
                <div style={{
                  minWidth: 44, height: 44,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Syne', fontWeight: 700, fontSize: 13,
                  color: 'var(--accent)'
                }}>
                  {renter.flat_no}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{renter.name}</div>
                  <div style={{ color: 'var(--text2)', fontSize: 13 }}>
                    ₹{(renter.monthly_rent || 0).toLocaleString('en-IN')}/mo · {renter.contact || 'No contact'}
                  </div>
                </div>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isPaid ? (
                    <span className="badge badge-green"><CheckCircle2 size={11} /> Paid</span>
                  ) : isPending ? (
                    <span className="badge badge-red"><XCircle size={11} /> Unpaid</span>
                  ) : (
                    <span className="badge badge-yellow"><Clock size={11} /> —</span>
                  )}
                  <ChevronRight size={16} color="var(--text3)" />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Renter Modal */}
      {showForm && (
        <RenterForm
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchData() }}
        />
      )}
    </div>
  )
}
