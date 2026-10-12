import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Link } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Public Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Team } from './pages/Team';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { Join } from './pages/Join';
import { Certificate } from './pages/Certificate';
import { Projects } from './pages/Projects';
import { Gallery } from './pages/Gallery';
import { Contact } from './pages/Contact';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminSetup } from './pages/admin/AdminSetup';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEvents } from './pages/admin/AdminEvents';
import { AdminTeam } from './pages/admin/AdminTeam';
import { AdminCertificates } from './pages/admin/AdminCertificates';
import { AdminMembership } from './pages/admin/AdminMembership';
import { AdminProjects } from './pages/admin/AdminProjects';
import { AdminGallery } from './pages/admin/AdminGallery';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminInquiries } from './pages/admin/AdminInquiries';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminRoles } from './pages/admin/AdminRoles';

// Public Layout Container
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-ivory-50 dark:bg-plum-950 text-plum-950 dark:text-ivory-50 transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// 404 Fallback
const NotFound: React.FC = () => {
  return (
    <div className="py-24 text-center space-y-4">
      <h1 className="text-4xl font-serif font-bold text-plum-950 dark:text-ivory-50">404 — Page Not Found</h1>
      <p className="text-sm text-gray-500 max-w-md mx-auto">
        The requested page does not exist or has been relocated within the Anvaya cultural portal.
      </p>
      <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-gold-600 text-white font-semibold text-xs shadow">
        Return to Home
      </Link>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/team" element={<Team />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:slug" element={<EventDetail />} />
                <Route path="/join" element={<Join />} />
                <Route path="/certificate" element={<Certificate />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Admin Auth & Setup */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/setup" element={<AdminSetup />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="team" element={<AdminTeam />} />
                <Route path="certificates" element={<AdminCertificates />} />
                <Route path="roles" element={<AdminRoles />} />
                <Route path="membership" element={<AdminMembership />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="announcements" element={<AdminAnnouncements />} />
                <Route path="inquiries" element={<AdminInquiries />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
