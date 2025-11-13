// Responsive Sadhana requirements card
function SadhanaRequirementsCard() {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e0e7ef",
        borderRadius: 14,
        padding: "16px 20px",
        margin: "16px auto 24px auto",
        maxWidth: 480,
        width: "100%",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        fontSize: 17,
        color: "#2d3a4a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center"
      }}
    >
      <strong style={{ fontSize: 18, color: "#1a237e" }}>Good Sadhana Criteria (per Month):</strong>
      <div style={{ marginTop: 8 }}>
        <span style={{ fontWeight: 500 }}>16 rounds/Day</span>,
        <span style={{ margin: "0 8px" }}>|</span>
        <span style={{ fontWeight: 500 }}>900m/Month reading</span>,
        <span style={{ margin: "0 8px" }}>|</span>
        <span style={{ fontWeight: 500 }}>900m/Month hearing</span>
        <span style={{ margin: "0 8px" }}>|</span>
        <span style={{ fontWeight: 500 }}>480m/Month service</span>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const monthNames = [
  'January','February','March','April','May','June','July','August','September','October','November','December'
];

export default function SadhanaReports({ devoteeId, userRole }) {
  // Pending state for dropdowns (for Generate Report)
  const [pendingDevoteeId, setPendingDevoteeId] = useState(devoteeId || '');
  const [pendingYear, setPendingYear] = useState(new Date().getFullYear());
  const [pendingMonth, setPendingMonth] = useState(new Date().getMonth()+1);
  const [pendingMode, setPendingMode] = useState('single');
  const [pendingPeriodLength, setPendingPeriodLength] = useState(3);
  // selection state
  const [selectedDevoteeId, setSelectedDevoteeId] = useState(devoteeId || '');
  const [assignedDevotees, setAssignedDevotees] = useState([]); // for counsellor
  const [searchTerm, setSearchTerm] = useState(''); // admin search input value
  const [suggestions, setSuggestions] = useState([]); // admin search suggestions
  const [searchLoading, setSearchLoading] = useState(false); // admin search loading state
  const [searchError, setSearchError] = useState(''); // admin search error
  const debounceRef = useRef(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth()+1);
  const [entries, setEntries] = useState([]); // single-month entries
  const [rangeData, setRangeData] = useState([]); // array of {year, month, entries: []}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const [mode, setMode] = useState('single'); // 'single' | 'range'
  const [periodLength, setPeriodLength] = useState(3); // for range mode (3,6,12)

  // Fetch assigned devotees for counsellor
  useEffect(() => {
    if (userRole === 'counsellor' && devoteeId) {
      axios.get(`${process.env.REACT_APP_API_BASE}/api/facilitator/devotees-by-facilitator-id`, {
        params: { facilitator_id: devoteeId }
      }).then(res => {
        setAssignedDevotees(res.data || []);
      }).catch(() => {
        setAssignedDevotees([]);
      });
    }
  }, [userRole, devoteeId]);

  // Debounced admin search suggestions (like AdminUploadedSadhanaReports)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      setSearchError('');
      return;
    }
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/devotees/search`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { query: searchTerm.trim() }
        });
        setSuggestions(res.data || []);
        setSearchError((res.data || []).length === 0 ? 'No devotees found' : '');
      } catch (err) {
        setSuggestions([]);
        setSearchError('Search failed');
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchTerm]);

  const handleSelectDevotee = (id, displayName) => {
    setSelectedDevoteeId(id);
    setPendingDevoteeId(id); // Ensure report uses the selected ID
    setSearchTerm(displayName);
    setSuggestions([]);
    setSearchError('');
  };

  const generateReport = async () => {
    let reportDevoteeId = pendingDevoteeId;
    if (userRole === 'user') {
      reportDevoteeId = devoteeId;
      setSelectedDevoteeId(devoteeId);
    } else {
      if (!pendingDevoteeId) {
        setError('Please select a devotee first.');
        return;
      }
      setSelectedDevoteeId(pendingDevoteeId);
    }
    setYear(pendingYear);
    setMonth(pendingMonth);
    setMode(pendingMode);
    setPeriodLength(pendingPeriodLength);
    setLoading(true);
    setError('');
    setGenerated(false);
    try {
      if (pendingMode === 'single') {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries-by-month`, {
          params: { user_id: reportDevoteeId, month: String(pendingMonth).padStart(2,'0'), year: pendingYear }
        });
        setEntries(res.data || []);
        setRangeData([]);
      } else {
        // build list of previous periodLength months including current month
        const list = [];
        let cYear = pendingYear;
        let cMonth = pendingMonth; // 1-12
        for (let i=0;i<pendingPeriodLength;i++) {
          list.push({ year: cYear, month: cMonth });
          cMonth -= 1;
          if (cMonth === 0) { cMonth = 12; cYear -= 1; }
        }
        const promises = list.map(item => axios.get(`${process.env.REACT_APP_API_BASE}/api/sadhana/entries-by-month`, {
          params: { user_id: reportDevoteeId, month: String(item.month).padStart(2,'0'), year: item.year }
        }).then(r => ({ ...item, entries: r.data || [] })).catch(() => ({ ...item, entries: [] })));
        const results = await Promise.all(promises);
        setRangeData(results);
        setEntries([]);
      }
      setGenerated(true);
    } catch (e) {
      setError('Failed to fetch entries.');
      setEntries([]);
      setRangeData([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper: did user do minimum rounds every day?
  function didChantingEveryDay(entries, minRounds, daysInMonth) {
    // Map day -> rounds
    //console.log("entries", entries);
    const dayRounds = {};
    entries.forEach(e => {
      // Try to get day from e.day or e.entry_date
      let day = e.day;
      if (!day && e.entry_date) {
        try { day = new Date(e.entry_date).getDate(); } catch {}
      }
      //console.log('Entry:', e, 'Resolved day:', day);
      if (!day) {
        // eslint-disable-next-line no-console
        //console.warn('Entry missing valid day or entry_date:', e);
      }
      if (day) dayRounds[Number(day)] = Number(e.chanting_rounds || 0);
    });
    let missingOrLow = [];
    //console.log("dayRounds", dayRounds);
    for (let d = 1; d <= daysInMonth; d++) {
      if (!dayRounds[d] || dayRounds[d] < minRounds) {
        missingOrLow.push({ day: d, rounds: dayRounds[d] || 0 });
      }
    }
    if (missingOrLow.length > 0) {
      // eslint-disable-next-line no-console
      //console.log('Chanting not sufficient for days:', missingOrLow);
      return false;
    }
    return true;
  }

  const chartData = useMemo(() => {
    if (!generated) return null;
    function getDaysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
    const CHANTING_PER_DAY = 16;
    const READING_PER_MONTH = 900;
    const HEARING_PER_MONTH = 900;
    const SERVICE_PER_MONTH = 480;
    if (mode === 'single') {
      if (entries.length === 0) return null;
      let reading = 0, hearing = 0, service = 0;
      entries.forEach(e => {
        reading += Number(e.reading_time || 0);
        hearing += Number(e.hearing_time || 0);
        service += Number(e.service_time || 0);
      });
      const days = getDaysInMonth(year, month);
      const goodChanting = didChantingEveryDay(entries, CHANTING_PER_DAY, days);
      const goodReading = reading >= READING_PER_MONTH;
      const goodHearing = hearing >= HEARING_PER_MONTH;
      const goodService = service >= SERVICE_PER_MONTH;
      const goodSadhana = goodChanting && goodReading && goodHearing && goodService;
      // Calculate total chanting for chart
      let chanting = 0;
      entries.forEach(e => { chanting += Number(e.chanting_rounds || 0); });
      return {
        labels: ['Chanting Rounds','Reading (min)','Hearing (min)','Service (min)'],
        datasets: [
          {
            label: `${monthNames[month-1]} ${year}` + (goodSadhana ? ' (Good Sadhana)' : ''),
            data: [chanting, reading, hearing, service],
            backgroundColor: [
              '#0d6efd',
              '#0ed3f6ff',
              '#ffc107',
              '#dc3545'
            ]
          }
        ]
      };
    } else {
      if (rangeData.length === 0) return null;
      const reversed = rangeData.slice().reverse();
      const labels = reversed.map(r => `${monthNames[r.month-1]} ${r.year}`);
      const chanting = [], reading = [], hearing = [], service = [], goodSadhanaArr = [];
      reversed.forEach(r => {
        const days = getDaysInMonth(r.year, r.month);
        const goodChanting = didChantingEveryDay(r.entries, CHANTING_PER_DAY, days);
        const readingSum = r.entries.reduce((acc,e) => acc + Number(e.reading_time||0),0);
        const hearingSum = r.entries.reduce((acc,e) => acc + Number(e.hearing_time||0),0);
        const serviceSum = r.entries.reduce((acc,e) => acc + Number(e.service_time||0),0);
        const chantingSum = r.entries.reduce((acc,e) => acc + Number(e.chanting_rounds||0),0);
        chanting.push(chantingSum);
        reading.push(readingSum);
        hearing.push(hearingSum);
        service.push(serviceSum);
        goodSadhanaArr.push(
          goodChanting &&
          readingSum >= READING_PER_MONTH &&
          hearingSum >= HEARING_PER_MONTH &&
          serviceSum >= SERVICE_PER_MONTH
        );
      });
      const labelArr = reversed.map((r, idx) => {
        return `${monthNames[r.month-1]} ${r.year}` + (goodSadhanaArr[idx] ? ' (Good Sadhana)' : '');
      });
      const datasets = [
        { label: 'Chanting Rounds', data: chanting, backgroundColor: '#0d6efd' },
        { label: 'Reading (min)', data: reading, backgroundColor: '#0ed3f6ff' },
        { label: 'Hearing (min)', data: hearing, backgroundColor: '#ffc107' },
        { label: 'Service (min)', data: service, backgroundColor: '#dc3545' }
      ];
      return {
        labels: labelArr,
        datasets
      };
    }
  }, [generated, mode, entries, rangeData, month, year]);

  const yearOptions = [pendingYear, pendingYear-1];

  return (
    <div className="container py-4">
      <SadhanaRequirementsCard />
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-primary text-white rounded-top-4">
          <h4 className="mb-0">📊 Sadhana Reports Chart</h4>
        </div>
        <div className="card-body bg-light rounded-bottom-4">
          <div className="row g-3 align-items-end mb-3">
            {/* Devotee selector */}
            <div className="col-md-4">
              {userRole === 'counsellor' && (
                <>
                  <label className="form-label fw-semibold">Search Assigned Devotee</label>
                  <div className="position-relative mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type name or email..."
                      value={searchTerm}
                      onChange={e => {
                        setSearchTerm(e.target.value);
                        setSelectedDevoteeId("");
                        setPendingDevoteeId("");
                      }}
                    />
                    {searchTerm.trim().length > 0 && (
                      <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 2000, maxHeight: 200, overflowY: 'auto' }}>
                        {assignedDevotees.filter(d => {
                          const q = searchTerm.trim().toLowerCase();
                          return (
                            (d.initiated_name && d.initiated_name.toLowerCase().includes(q)) ||
                            (`${d.first_name} ${d.last_name}`.toLowerCase().includes(q)) ||
                            (d.email && d.email.toLowerCase().includes(q))
                          );
                        }).map(d => (
                          <li
                            key={d.devotee_id || d.id}
                            className={`list-group-item list-group-item-action${selectedDevoteeId === (d.devotee_id || d.id) ? ' active' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              setSelectedDevoteeId(d.devotee_id || d.id);
                              setPendingDevoteeId(d.devotee_id || d.id);
                              setSearchTerm(d.initiated_name?.trim() || `${d.first_name} ${d.last_name}`);
                            }}
                          >
                            {d.initiated_name?.trim() ? `${d.initiated_name.trim()} - ${d.email}` : `${d.first_name} ${d.last_name} - ${d.email}`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {selectedDevoteeId && <small className="text-muted">Selected ID: {selectedDevoteeId}</small>}
                </>
              )}
              {userRole === 'admin' && (
                <>
                  <label className="form-label fw-semibold">Search Devotee</label>
                  <div className="position-relative mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type name or email..."
                      value={searchTerm}
                      onChange={e => {
                        setSearchTerm(e.target.value);
                        setSelectedDevoteeId("");
                      }}
                    />
                    {suggestions.length > 0 && (
                      <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 2000, maxHeight: 200, overflowY: 'auto' }}>
                        {suggestions.map(s => (
                          <li
                            key={s.devotee_id || s.id || s.email}
                            className={`list-group-item list-group-item-action${selectedDevoteeId === (s.devotee_id || s.id) ? ' active' : ''}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleSelectDevotee(s.devotee_id || s.id, s.initiated_name?.trim() || `${[s.first_name, s.last_name].filter(Boolean).join(' ')}`)}
                          >
                            {s.initiated_name?.trim() ? `${s.initiated_name.trim()} - ${s.email}` : `${[s.first_name, s.last_name].filter(Boolean).join(' ')} - ${s.email}`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {searchError && <div className="small text-danger mb-1">{searchError}</div>}
                  {selectedDevoteeId && <small className="text-muted">Selected ID: {selectedDevoteeId}</small>}
                </>
              )}
              {/* For users, no devotee selector is shown */}
            </div>
            <div className="col-md-8">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Mode</label>
                  <select className="form-select" value={pendingMode} onChange={e => setPendingMode(e.target.value)}>
                    <option value="single">Single Month</option>
                    <option value="range">Period (Previous N Months)</option>
                  </select>
                </div>
                {pendingMode === 'single' && (
                  <>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Year</label>
                      <select className="form-select" value={pendingYear} onChange={e => setPendingYear(Number(e.target.value))}>
                        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Month</label>
                      <select className="form-select" value={pendingMonth} onChange={e => setPendingMonth(Number(e.target.value))}>
                        {monthNames.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
                      </select>
                    </div>
                  </>
                )}
                {pendingMode === 'range' && (
                  <>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Current Year</label>
                      <select className="form-select" value={pendingYear} onChange={e => setPendingYear(Number(e.target.value))}>
                        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Months Back</label>
                      <select className="form-select" value={pendingPeriodLength} onChange={e => setPendingPeriodLength(Number(e.target.value))}>
                        <option value={3}>Previous 3</option>
                        <option value={6}>Previous 6</option>
                        <option value={12}>Previous 12 (Year)</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="col-md-4 d-flex align-items-end">
                  <button className="btn btn-success w-100" onClick={generateReport} disabled={loading}>Generate Report</button>
                </div>
              </div>
            </div>
          </div>
          {loading && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status" />
            </div>
          )}
          {error && !loading && <div className="alert alert-danger py-2">{error}</div>}
          {generated && !loading && mode==='single' && entries.length === 0 && !error && (
            <div className="alert alert-warning py-2">No entries for selected month.</div>
          )}
          {generated && !loading && (
            <div className="mb-2 text-muted small d-flex align-items-center flex-wrap">
              {mode === 'range' && rangeData.length > 0 && chartData && (
                <span>Showing aggregated data for previous {periodLength} months including current.</span>
              )}
            </div>
          )}
          {chartData && !loading && (
            <>
              <div className="p-3 bg-white rounded-3 shadow-sm" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <div 
                  style={{
                    minWidth: 340,
                    width: '100%',
                    maxWidth: 1200,
                    margin: '0 auto',
                    height: window.innerWidth < 600 ? 320 : 420
                  }}
                >
                  <Bar 
                    data={chartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' },
                        title: { display: false },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.dataset.label || '';
                              const value = context.parsed.y;
                              return `${label}: ${value}`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: { beginAtZero: true },
                        x: {
                          ticks: {
                            callback: function(value, index, ticks) {
                              const label = this.getLabelForValue ? this.getLabelForValue(value) : value;
                              if (typeof label === 'string' && label.includes('(Good Sadhana)')) {
                                return label.replace('(Good Sadhana)', '\u2714 (Good Sadhana)');
                              }
                              return label;
                            },
                            color: function(context) {
                              const label = context.tick && context.tick.label;
                              if (typeof label === 'string' && label.includes('(Good Sadhana)')) {
                                return '#137333'; // dark green
                              }
                              return undefined;
                            },
                            font: function(context) {
                              const label = context.tick && context.tick.label;
                              if (typeof label === 'string' && label.includes('(Good Sadhana)')) {
                                return { weight: 'bold' };
                              }
                              return {};
                            }
                          }
                        }
                      }
                    }}
                    height={window.innerWidth < 600 ? 320 : 420}
                  />
                </div>
              </div>
              {/* Boxed list of Good Sadhana months in period mode */}
              {mode === 'range' && chartData.labels && chartData.labels.length > 0 && (
                <div className="alert alert-success mt-3" style={{maxWidth: 600}}>
                  <b>Good Sadhana Achievements by Month:</b>
                  <ul className="mb-0 mt-2">
                    {rangeData.length === 0 ? (
                      <li>None in this period</li>
                    ) : (
                      rangeData.slice().reverse().map((r, idx) => {
                        const days = new Date(r.year, r.month, 0).getDate();
                        const goodChanting = didChantingEveryDay(r.entries, 16, days);
                        const reading = r.entries.reduce((acc,e) => acc + Number(e.reading_time||0),0);
                        const hearing = r.entries.reduce((acc,e) => acc + Number(e.hearing_time||0),0);
                        const service = r.entries.reduce((acc,e) => acc + Number(e.service_time||0),0);
                        const goodReading = reading >= 900;
                        const goodHearing = hearing >= 900;
                        const goodService = service >= 480;
                        const achievements = [];
                        if (goodChanting) achievements.push('Chanting');
                        if (goodReading) achievements.push('Reading');
                        if (goodHearing) achievements.push('Hearing');
                        if (goodService) achievements.push('Service');
                        if (achievements.length === 0) return null;
                        return (
                          <li key={idx}>
                            <b>{monthNames[r.month-1]} {r.year}:</b> Good in {achievements.join(', ')}
                          </li>
                        );
                      })
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
