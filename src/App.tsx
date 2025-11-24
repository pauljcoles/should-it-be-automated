import './App.css'
import { Header, TestCaseTable, ExistingFunctionalitySidebar, HelpModal, StateDiagramHistoryModal } from './components'
import { Notification } from './components/Notification'
import { StorageErrorModal } from './components/StorageErrorModal'
import { useAppContext } from './context'

function App() {
  const { appState, uiState, setStorageErrorModalOpen } = useAppContext();

  return (
    <div className="h-full bg-background flex flex-col">
      <Header />
      {/* Responsive main layout: column on mobile/tablet, row on desktop */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        <ExistingFunctionalitySidebar />
        {/* Responsive padding: smaller on mobile, larger on desktop */}
        <div className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
          <div className="border rounded-lg bg-white shadow-lg h-full flex flex-col">
            <TestCaseTable />
          </div>
        </div>
      </main>
      <HelpModal />
      <StateDiagramHistoryModal applicationName={appState.projectName} />
      <StorageErrorModal 
        isOpen={uiState.isStorageErrorModalOpen} 
        onClose={() => setStorageErrorModalOpen(false)} 
      />
      <Notification />
    </div>
  )
}

export default App
