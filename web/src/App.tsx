import { AppShell } from './components/AppShell';
import { StoreProvider } from './lib/store';

export default function App() {
  return (
    <StoreProvider><AppShell /></StoreProvider>
  );
}
