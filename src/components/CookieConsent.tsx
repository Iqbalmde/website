import { useEffect, useRef, useState } from "react";

const KEY = "zelantrix-cookie-choice";
const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
const SETTINGS_EVENT = "zx-cookie-settings";

function readChoice(): { preferences: boolean; analytics: boolean } | null {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || "null");
    if (c && c.version === 1 && typeof c.preferences === "boolean" && typeof c.analytics === "boolean" && Date.now() - c.savedAt < MAX_AGE) {
      return { preferences: c.preferences, analytics: c.analytics };
    }
  } catch {
    // Storage unavailable: the banner still works for this page view.
  }
  return null;
}

function saveChoice(preferences: boolean, analytics: boolean) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, necessary: true, preferences, analytics, savedAt: Date.now() }));
  } catch {
    // Ignore: the popup will appear again on the next visit.
  }
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

export default function CookieConsent() {
  const [bannerOpen, setBannerOpen] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const saved = readChoice();
    if (saved) {
      setPreferences(saved.preferences);
      setAnalytics(saved.analytics);
    }
    setBannerOpen(true);
    const open = () => dialogRef.current?.showModal();
    window.addEventListener(SETTINGS_EVENT, open);
    return () => window.removeEventListener(SETTINGS_EVENT, open);
  }, []);

  const close = () => {
    dialogRef.current?.close();
    setBannerOpen(false);
  };
  const necessaryOnly = () => {
    saveChoice(false, false);
    setPreferences(false);
    setAnalytics(false);
    close();
  };
  const acceptAll = () => {
    saveChoice(true, true);
    setPreferences(true);
    setAnalytics(true);
    close();
  };
  const savePreferences = () => {
    saveChoice(preferences, analytics);
    close();
  };

  return (
    <>
      {bannerOpen && (
        <section className="cookie-banner" aria-labelledby="cookie-banner-title">
          <h2 id="cookie-banner-title">Your privacy is important to us</h2>
          <p>
            We use essential storage to remember your choice and support secure team sign-in. Optional cookies are not currently active. Choose what you would allow if enabled. See our <a href="/privacy-policy">Privacy Policy</a>.
          </p>
          <div className="cookie-actions">
            <button className="policy-button" type="button" onClick={necessaryOnly}>Necessary Cookies Only</button>
            <button className="policy-button" type="button" onClick={() => dialogRef.current?.showModal()}>Configure Cookies</button>
            <button className="policy-button policy-button-solid" type="button" onClick={acceptAll}>Accept All Cookies</button>
          </div>
        </section>
      )}
      <dialog ref={dialogRef} className="cookie-dialog" aria-labelledby="cookie-dialog-title">
        <button className="cookie-close" type="button" aria-label="Close" onClick={() => dialogRef.current?.close()}>×</button>
        <h2 id="cookie-dialog-title">Cookie preferences</h2>
        <p>You control optional storage. No optional preference or analytics cookies are currently active on this website.</p>
        <div className="cookie-option">
          <div>
            <h3>Necessary</h3>
            <p>Remembering this choice and secure team sign-in.</p>
          </div>
          <span className="cookie-required">Always on</span>
        </div>
        <div className="cookie-option">
          <div>
            <h3>Preferences</h3>
            <p>Optional personalised settings, if introduced.</p>
          </div>
          <input type="checkbox" className="cookie-switch" aria-label="Allow preference cookies" checked={preferences} onChange={(e) => setPreferences(e.target.checked)} />
        </div>
        <div className="cookie-option">
          <div>
            <h3>Analytics</h3>
            <p>Optional usage measurement, if introduced.</p>
          </div>
          <input type="checkbox" className="cookie-switch" aria-label="Allow analytics cookies" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
        </div>
        <p className="cookie-detail">
          Your choice is stored for up to six months. Change or withdraw it anytime using Cookie Settings. <a href="/cookie-policy">Cookie Policy ↗</a>
        </p>
        <div className="cookie-actions">
          <button className="policy-button" type="button" onClick={necessaryOnly}>Necessary Cookies Only</button>
          <button className="policy-button policy-button-solid" type="button" onClick={savePreferences}>Save Preferences</button>
        </div>
      </dialog>
    </>
  );
}
