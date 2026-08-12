import { useSettings } from './hooks/useSettings';
import { useNotifications } from './hooks/useNotifications';
import { useTheme } from './hooks/useTheme';
import { SettingsScreen } from './components/SettingsScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { Settings } from './types/settings';

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

  const handleOnboardingComplete = (newSettings: Partial<Settings>) => {
    updateSettings(newSettings);
  };

  if (!settings.onboardingComplete) {
    return (
      <OnboardingScreen
        onComplete={handleOnboardingComplete}
        onRequestPermission={requestPermission}
      />
    );
  }

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
