import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children, onLogout }) {
    return (
        <div className="app-layout">
            <Sidebar onLogout={onLogout} />
            <div className="app-main">
                <Header />
                <main className="app-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
