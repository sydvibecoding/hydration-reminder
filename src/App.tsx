import { useSettings } from './hooks/useSettings';
import { useNotifications } from './hooks/useNotifications';
import { useTheme } from './hooks/useTheme';
import { SettingsScreen } from './components/SettingsScreen';

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

  return (
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
    />
  );
}

export default App;
