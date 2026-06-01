import Sidebar from './Sidebar';

function PageWrapper({ children }) {
  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default PageWrapper;