import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Car, CheckCircle2, CalendarDays, Wallet, Plus, Search, Filter, FileText, AlertTriangle } from 'lucide-react';
import './style.css';

const initialCars = [
  { id: 'XE001', name: 'VinFast VF3', plate: '51A-123.45', type: 'Xe điện mini', price: 500000, status: 'Sẵn sàng' },
  { id: 'XE002', name: 'Toyota Vios', plate: '51G-888.22', type: 'Sedan', price: 700000, status: 'Đang thuê' },
  { id: 'XE003', name: 'Mitsubishi Xpander', plate: '60C-456.78', type: '7 chỗ', price: 950000, status: 'Bảo trì' },
  { id: 'XE004', name: 'Hyundai Accent', plate: '30E-222.99', type: 'Sedan', price: 750000, status: 'Sẵn sàng' },
];

const initialBookings = [
  { id: 'HD001', customer: 'Nguyễn Văn Minh', phone: '0909 111 222', carId: 'XE002', start: '2026-05-06', end: '2026-05-09', deposit: 3000000, status: 'Đang thuê' },
  { id: 'HD002', customer: 'Trần Thị Lan', phone: '0912 333 444', carId: 'XE001', start: '2026-05-12', end: '2026-05-14', deposit: 2000000, status: 'Đã đặt' },
];

function formatMoney(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function diffDays(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 1);
}

const statusClass = {
  'Sẵn sàng': 'green',
  'Đang thuê': 'blue',
  'Bảo trì': 'orange',
  'Đã đặt': 'purple',
  'Hoàn tất': 'gray',
};

function StatCard({ icon: Icon, title, value, subtitle }) {
  return (
    <div className="card stat-card">
      <div className="icon-box"><Icon size={24} /></div>
      <div>
        <p className="muted small">{title}</p>
        <h3>{value}</h3>
        <p className="muted tiny">{subtitle}</p>
      </div>
    </div>
  );
}

function App() {
  const [cars, setCars] = useState(initialCars);
  const [bookings, setBookings] = useState(initialBookings);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer: '', phone: '', carId: 'XE001', start: '2026-05-06', end: '2026-05-07', deposit: 0, status: 'Đã đặt' });

  const filteredCars = cars.filter((car) => {
    const matchQuery = `${car.name} ${car.plate} ${car.type}`.toLowerCase().includes(query.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || car.status === statusFilter;
    return matchQuery && matchStatus;
  });

  const bookingRows = bookings.map((booking) => {
    const car = cars.find((c) => c.id === booking.carId);
    const days = diffDays(booking.start, booking.end);
    const total = days * (car?.price || 0);
    return { ...booking, car, days, total };
  });

  const stats = useMemo(() => {
    return {
      available: cars.filter((c) => c.status === 'Sẵn sàng').length,
      renting: cars.filter((c) => c.status === 'Đang thuê').length,
      revenue: bookingRows.reduce((sum, b) => sum + b.total, 0),
    };
  }, [cars, bookings]);

  const addBooking = () => {
    if (!form.customer.trim() || !form.phone.trim()) {
      alert('Vui lòng nhập tên khách hàng và số điện thoại.');
      return;
    }
    const newBooking = { ...form, id: `HD${String(bookings.length + 1).padStart(3, '0')}`, deposit: Number(form.deposit || 0) };
    setBookings([newBooking, ...bookings]);
    if (form.status === 'Đang thuê') {
      setCars(cars.map((car) => car.id === form.carId ? { ...car, status: 'Đang thuê' } : car));
    }
    setForm({ customer: '', phone: '', carId: 'XE001', start: '2026-05-06', end: '2026-05-07', deposit: 0, status: 'Đã đặt' });
    setShowForm(false);
  };

  return (
    <main className="page">
      <div className="container">
        <header className="header">
          <div>
            <p className="brand">Phần mềm quản lý cho thuê xe ô tô</p>
            <h1>Dashboard Cho Thuê Xe VF3</h1>
            <p className="muted">Quản lý xe, khách thuê, hợp đồng và doanh thu trong một màn hình.</p>
          </div>
          <button className="primary-btn" onClick={() => setShowForm(!showForm)}><Plus size={18} /> Tạo hợp đồng thuê</button>
        </header>

        <section className="stats-grid">
          <StatCard icon={Car} title="Tổng số xe" value={cars.length} subtitle="Trong danh sách quản lý" />
          <StatCard icon={CheckCircle2} title="Xe sẵn sàng" value={stats.available} subtitle="Có thể cho thuê ngay" />
          <StatCard icon={CalendarDays} title="Đang thuê" value={stats.renting} subtitle="Xe đang có khách" />
          <StatCard icon={Wallet} title="Doanh thu dự kiến" value={formatMoney(stats.revenue)} subtitle="Theo hợp đồng hiện có" />
        </section>

        {showForm && (
          <section className="card form-card">
            <h2>Tạo hợp đồng thuê xe</h2>
            <div className="form-grid">
              <input placeholder="Tên khách hàng" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} />
              <input placeholder="Số điện thoại" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <select value={form.carId} onChange={(e) => setForm({ ...form, carId: e.target.value })}>
                {cars.map((car) => <option key={car.id} value={car.id}>{car.name} - {car.plate}</option>)}
              </select>
              <input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
              <input type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
              <input type="number" placeholder="Tiền cọc" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} />
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Đã đặt</option>
                <option>Đang thuê</option>
                <option>Hoàn tất</option>
              </select>
            </div>
            <div className="actions"><button className="ghost-btn" onClick={() => setShowForm(false)}>Hủy</button><button className="primary-btn" onClick={addBooking}>Lưu hợp đồng</button></div>
          </section>
        )}

        <section className="main-grid">
          <div className="card wide-card">
            <div className="section-title">
              <h2><Car size={22} /> Danh sách xe</h2>
              <div className="tools">
                <label><Search size={16} /><input placeholder="Tìm xe, biển số..." value={query} onChange={(e) => setQuery(e.target.value)} /></label>
                <label><Filter size={16} /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>Tất cả</option><option>Sẵn sàng</option><option>Đang thuê</option><option>Bảo trì</option></select></label>
              </div>
            </div>
            <div className="table-wrap"><table><thead><tr><th>Xe</th><th>Biển số</th><th>Loại</th><th>Giá/ngày</th><th>Trạng thái</th></tr></thead><tbody>{filteredCars.map((car) => <tr key={car.id}><td><b>{car.name}</b></td><td>{car.plate}</td><td>{car.type}</td><td>{formatMoney(car.price)}</td><td><span className={`badge ${statusClass[car.status]}`}>{car.status}</span></td></tr>)}</tbody></table></div>
          </div>

          <aside className="card note-card">
            <h2><AlertTriangle size={22} /> Ghi chú vận hành</h2>
            <div className="note orange"><b>Xe cần bảo trì</b><p>Mitsubishi Xpander đang bảo trì. Không nên tạo hợp đồng mới.</p></div>
            <div className="note blue"><b>Nhắc trả xe</b><p>Hợp đồng HD001 dự kiến trả xe ngày 09/05/2026.</p></div>
            <div className="note green"><b>Xe sẵn sàng</b><p>Có {stats.available} xe có thể cho thuê ngay hôm nay.</p></div>
          </aside>
        </section>

        <section className="card">
          <h2><FileText size={22} /> Hợp đồng / đơn thuê gần đây</h2>
          <div className="table-wrap"><table><thead><tr><th>Mã HĐ</th><th>Khách hàng</th><th>Xe thuê</th><th>Thời gian</th><th>Số ngày</th><th>Tổng tiền</th><th>Cọc</th><th>Trạng thái</th></tr></thead><tbody>{bookingRows.map((b) => <tr key={b.id}><td><b>{b.id}</b></td><td><b>{b.customer}</b><br /><span className="muted tiny">{b.phone}</span></td><td>{b.car?.name || 'Không rõ'}</td><td>{b.start} → {b.end}</td><td>{b.days}</td><td><b>{formatMoney(b.total)}</b></td><td>{formatMoney(b.deposit)}</td><td><span className={`badge ${statusClass[b.status] || 'gray'}`}>{b.status}</span></td></tr>)}</tbody></table></div>
        </section>

        <footer>Bản demo MVP — có thể nâng cấp thêm đăng nhập, cơ sở dữ liệu, in hợp đồng PDF, quản lý thanh toán và lịch bảo trì.</footer>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
