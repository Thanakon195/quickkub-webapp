import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';

// Import pages
import Dashboard from './pages/dashboard';
import MerchantManagement from './pages/MerchantManagement';
import TransactionMonitoring from './pages/TransactionMonitoring';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand href="/">QuickKub Admin Panel</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="/dashboard">Dashboard</Nav.Link>
                <NavDropdown title="Management" id="basic-nav-dropdown">
                  <NavDropdown.Item href="/merchants">Merchant Management</NavDropdown.Item>
                  <NavDropdown.Item href="/transactions">Transaction Monitoring</NavDropdown.Item>
                  <NavDropdown.Item href="/payments">Payment Management</NavDropdown.Item>
                  <NavDropdown.Item href="/settlements">Settlement Management</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="Reports" id="reports-nav-dropdown">
                  <NavDropdown.Item href="/reports/transactions">Transaction Reports</NavDropdown.Item>
                  <NavDropdown.Item href="/reports/merchants">Merchant Reports</NavDropdown.Item>
                  <NavDropdown.Item href="/reports/settlements">Settlement Reports</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="System" id="system-nav-dropdown">
                  <NavDropdown.Item href="/admin/settings">System Settings</NavDropdown.Item>
                  <NavDropdown.Item href="/admin/logs">System Logs</NavDropdown.Item>
                  <NavDropdown.Item href="/admin/backup">Database Backup</NavDropdown.Item>
                </NavDropdown>
              </Nav>
              <Nav>
                <NavDropdown title="Admin User" id="user-nav-dropdown">
                  <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="/logout">Logout</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/merchants" element={<MerchantManagement />} />
            <Route path="/transactions" element={<TransactionMonitoring />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
