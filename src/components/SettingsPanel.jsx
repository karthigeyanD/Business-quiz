import React from 'react';
import { Clock, Sliders, Repeat, Shuffle, Monitor, Eye, Layout, Palette, ShieldAlert } from 'lucide-react';

export default function SettingsPanel({ settings, onUpdateSettings }) {
  const durations = [3, 5, 10, 15, 30];
  const transitions = [
    { id: 'fade', name: 'Fade' },
    { id: 'slide', name: 'Slide' },
    { id: 'slide-up', name: 'Slide Up' },
    { id: 'zoom', name: 'Zoom In' },
    { id: 'flip', name: '3D Flip' },
    { id: 'blur', name: 'Soft Blur' },
    { id: 'none', name: 'Instant' }
  ];

  const fitModes = [
    { id: 'contain', name: 'Fit Screen (Contain)' },
    { id: 'cover', name: 'Fill Screen (Crop)' }
  ];

  const bgThemes = [
    { id: 'dark', name: 'Deep Midnight' },
    { id: 'pitch', name: 'Pure Black' },
    { id: 'blur', name: 'Blurred Photo' },
    { id: 'glow', name: 'Radial Glow' }
  ];

  return (
    <div className="settings-group">
      {/* Slide Timing */}
      <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
        <div className="setting-label">
          <div className="setting-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} className="text-indigo-400" />
            <span>Slide Duration</span>
          </div>
          <div className="setting-desc">Time spent on each photo during autoplay</div>
        </div>
        <div className="option-pills">
          {durations.map((sec) => (
            <button
              key={sec}
              className={`pill-btn ${settings.duration === sec ? 'active' : ''}`}
              onClick={() => onUpdateSettings({ duration: sec })}
            >
              {sec}s
            </button>
          ))}
        </div>
      </div>

      {/* Transition Effect */}
      <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
        <div className="setting-label">
          <div className="setting-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} className="text-purple-400" />
            <span>Transition Style</span>
          </div>
          <div className="setting-desc">Visual animation between slides</div>
        </div>
        <div className="option-pills">
          {transitions.map((t) => (
            <button
              key={t.id}
              className={`pill-btn ${settings.transition === t.id ? 'active' : ''}`}
              onClick={() => onUpdateSettings({ transition: t.id })}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loop Option */}
      <div className="setting-row">
        <div className="setting-label">
          <div className="setting-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Repeat size={16} className="text-pink-400" />
            <span>Loop Slideshow</span>
          </div>
          <div className="setting-desc">Automatically restart after the final photo</div>
        </div>
        <input
          type="checkbox"
          className="switch-input"
          checked={settings.loop}
          onChange={(e) => onUpdateSettings({ loop: e.target.checked })}
        />
      </div>

      {/* Shuffle Option */}
      <div className="setting-row">
        <div className="setting-label">
          <div className="setting-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shuffle size={16} className="text-cyan-400" />
            <span>Shuffle Order</span>
          </div>
          <div className="setting-desc">Play slides in random sequence</div>
        </div>
        <input
          type="checkbox"
          className="switch-input"
          checked={settings.shuffle}
          onChange={(e) => onUpdateSettings({ shuffle: e.target.checked })}
        />
      </div>

      {/* Image Fit Mode */}
      <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
        <div className="setting-label">
          <div className="setting-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layout size={16} className="text-emerald-400" />
            <span>Photo Fit Mode</span>
          </div>
          <div className="setting-desc">Prevent stretching or distorting images</div>
        </div>
        <div className="option-pills">
          {fitModes.map((fm) => (
            <button
              key={fm.id}
              className={`pill-btn ${settings.fitMode === fm.id ? 'active' : ''}`}
              onClick={() => onUpdateSettings({ fitMode: fm.id })}
            >
              {fm.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stage Background Atmosphere */}
      <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
        <div className="setting-label">
          <div className="setting-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={16} className="text-amber-400" />
            <span>Projector Background</span>
          </div>
          <div className="setting-desc">Backdrop style behind photos</div>
        </div>
        <div className="option-pills">
          {bgThemes.map((bg) => (
            <button
              key={bg.id}
              className={`pill-btn ${settings.bgTheme === bg.id ? 'active' : ''}`}
              onClick={() => onUpdateSettings({ bgTheme: bg.id })}
            >
              {bg.name}
            </button>
          ))}
        </div>
      </div>

      {/* Captions Visibility */}
      <div className="setting-row">
        <div className="setting-label">
          <div className="setting-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={16} className="text-blue-400" />
            <span>Show Slide Captions</span>
          </div>
          <div className="setting-desc">Display quiz question / titles overlay</div>
        </div>
        <input
          type="checkbox"
          className="switch-input"
          checked={settings.showCaptions}
          onChange={(e) => onUpdateSettings({ showCaptions: e.target.checked })}
        />
      </div>

      {/* Progress Bar Visibility */}
      <div className="setting-row">
        <div className="setting-label">
          <div className="setting-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={16} className="text-teal-400" />
            <span>Show Timer Progress Bar</span>
          </div>
          <div className="setting-desc">Display remaining slide time indicator</div>
        </div>
        <input
          type="checkbox"
          className="switch-input"
          checked={settings.showProgressBar}
          onChange={(e) => onUpdateSettings({ showProgressBar: e.target.checked })}
        />
      </div>
    </div>
  );
}
