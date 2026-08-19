import { useSettings } from './hooks/useSettings';
import { useNotifications } from './hooks/useNotifications';
import { useTheme } from './hooks/useTheme';
import { useDarkMode } from './hooks/useDarkMode';
import { useLocale } from './hooks/useLocale';
import { SettingsScreen } from './components/SettingsScreen';
import { DesktopGate } from './components/DesktopGate';

function App() {
  const {
    settings,
    updateSettings,
    isPaused,
    pauseFor,
    pauseForRestOfDay,
    resumeNotifications,
  } = useSettings();

  const {
    permission,
    requestPermission,
    nextNotificationTime,
    sendTestNotification,
  } = useNotifications(settings);

  const themeState = useTheme();
  const darkMode = useDarkMode();
  const localeState = useLocale();

  return (
    <>
      <DesktopGate t={localeState.t} />
      <div className="app-shell">
        <SettingsScreen
          settings={settings}
          onUpdateSettings={updateSettings}
          permission={permission}
          onRequestPermission={requestPermission}
          nextNotificationTime={nextNotificationTime}
          onSendTestNotification={sendTestNotification}
          isPaused={isPaused()}
          onPauseFor={pauseFor}
          onPauseForRestOfDay={pauseForRestOfDay}
          onResume={resumeNotifications}
          themeState={themeState}
          darkMode={darkMode}
          localeState={localeState}
        />
      </div>
    </>
  );
}

export default App;
