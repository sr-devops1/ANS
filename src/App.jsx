import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import MainCanvas from './components/MainCanvas';

export default function App() {
  return (
    <AppProvider>
      <div className="app">
        <Header />
        <div className="app-body">
          <Sidebar />
          <MainCanvas />
          <RightPanel />
        </div>
        <Footer />
      </div>
    </AppProvider>
  );
}
