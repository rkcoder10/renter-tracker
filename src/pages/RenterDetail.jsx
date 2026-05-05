import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Edit2, Trash2, Plus, CheckCircle2, XCircle, IndianRupee } from 'lucide-react'
import RenterForm from '../components/RenterForm'
import PaymentModal from '../components/PaymentModal'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function RenterDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [renter, setRenter] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [paymentModal, setPaymentModal] = useState(null) // {month, year, existing?}
  const [deleting, setDeleting] = useState(false)

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())

  useEffect(() => { fetchData() }, [id, viewYear])

  async function fetchData() {
    setLoading(true)
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from('renters').select('*').eq('id', id).single(),
      supabase.from('payments').select('*').eq('renter_id', id).eq('year', viewYear).order('month')
    ])
    if (!r) { navigate('/'); return }
    setRenter(r)
    setPayments(p || [])
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm(`Delete ${renter.name}? This will also remove all payment history.`)) return
    setDeleting(true)
    await supabase.from('renters').update({ is_active: false }).eq('id', id)
    navigate('/')
  }

  function getPayment(month) {
    return payments.find(p => p.month === month)
  }

  const totalPaid = payments.filter(p => p.is_paid).reduce((s, p) => s + (p.amount_received || 0), 0)
  const paidMonths = payments.filter(p => p.is_paid).length

  if (loading) return <div style={{textAlign:'center',padding:40,color:'var(--text2)'}}>Loading…</div>
  if (!renter) return null

  return (
    <div>
      {/* Back + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
          <ArrowLeft size={15} /> Back
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowEdit(true)}>
            <Edit2 size={14} /> Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 size={14} /> {deleting ? '…' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Renter info card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, minWidth: 52,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: '#000'
          }}>
            {renter.flat_no}
          </div>
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 4 }}>{renter.name}</h2>
            <div style={{ color: 'var(--text2)', fontSize: 14 }}>
              Flat {renter.flat_no} · Age {renter.age || '—'}
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="grid-2" style={{ gap: 14 }}>
          <InfoRow label="Contact" value={renter.contact} />
          <InfoRow label="Monthly Rent" value={renter.monthly_rent ? `₹${Number(renter.monthly_rent).toLocaleString('en-IN')}` : '—'} />
          <InfoRow label="Security Deposit" value={renter.security_deposit ? `₹${Number(renter.security_deposit).toLocaleString('en-IN')}` : '—'} />
          <InfoRow label="Lease Start" value={renter.lease_start_date ? new Date(renter.lease_start_date).toLocaleDateString('en-IN') : '—'} />
          <InfoRow label="Aadhaar" value={renter.aadhaar ? `****${renter.aadhaar.slice(-4)}` : '—'} />
          <InfoRow label="PAN" value={renter.pan || '—'} />
        </div>

        {renter.notes && (
          <>
            <div className="divider" />
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text)', marginRight: 8 }}>Notes:</span>
              {renter.notes}
            </div>
          </>
        )}
      </div>

      {/* Payment history */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 17 }}>Payments</h2>
          <div style={{ color: 'var(--text2)', fontSize: 13, marginTop: 2 }}>
            {paidMonths} months paid · ₹{totalPaid.toLocaleString('en-IN')} collected in {viewYear}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setViewYear(y => y - 1)} style={{padding:'6px 10px'}}>‹</button>
          <span style={{ fontFamily: 'Syne', fontWeight: 700 }}>{viewYear}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setViewYear(y => y + 1)} style={{padding:'6px 10px'}}>›</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MONTHS.map((monthName, idx) => {
          const month = idx + 1
          const payment = getPayment(month)
          const isFuture = viewYear > now.getFullYear() || (viewYear === now.getFullYear() && month > now.getMonth() + 1)

          return (
            <div
              key={month}
              className="card"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px',
                cursor: isFuture ? 'default' : 'pointer',
                opacity: isFuture ? 0.4 : 1,
                borderLeft: `3px solid ${payment?.is_paid ? 'var(--green)' : 'var(--border)'}`
              }}
              onClick={() => !isFuture && setPaymentModal({ month, year: viewYear, existing: payment })}
            >
              <div style={{ minWidth: 80, fontWeight: 600, fontSize: 14 }}>{monthName}</div>

              <div style={{ flex: 1 }}>
                {payment?.is_paid ? (
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                    ₹{Number(payment.amount_received).toLocaleString('en-IN')}
                    {payment.payment_date && ` · ${new Date(payment.payment_date).toLocaleDateString('en-IN')}`}
                    {payment.notes && ` · ${payment.notes}`}
                  </div>
                ) : payment ? (
                  <div style={{ fontSize: 13, color: 'var(--red)' }}>Marked unpaid{payment.notes ? ` · ${payment.notes}` : ''}</div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--text3)' }}>Not recorded</div>
                )}
              </div>

              {payment?.is_paid ? (
                <span className="badge badge-green"><CheckCircle2 size={11} /> Paid</span>
              ) : payment ? (
                <span className="badge badge-red"><XCircle size={11} /> Unpaid</span>
              ) : !isFuture ? (
                <span style={{ color: 'var(--text3)', fontSize: 13 }}>+ Log</span>
              ) : null}
            </div>
          )
        })}
      </div>

      {/* Modals */}
      {showEdit && (
        <RenterForm
          renter={renter}
          onClose={() => setShowEdit(false)}
          onSaved={() => { setShowEdit(false); fetchData() }}
        />
      )}
      {paymentModal && (
        <PaymentModal
          renterId={id}
          month={paymentModal.month}
          year={paymentModal.year}
          existingPayment={paymentModal.existing}
          defaultRent={renter.monthly_rent}
          onClose={() => setPaymentModal(null)}
          onSaved={() => { setPaymentModal(null); fetchData() }}
        />
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{value || '—'}</div>
    </div>
  )
}
