import React from 'react';
import { X, Compass, MapPin } from 'lucide-react';
import { LocationItem } from '../types';
import { getQiblaInfo } from '../services/prayerService';
import { formatLocationDisplay } from '../services/locationLocalization';
import { useLanguage } from '../context/LanguageContext';

interface QiblaModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationItem;
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radiusKm = 6371;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(deltaLon / 2) ** 2;
  return Math.round(radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export const QiblaModal: React.FC<QiblaModalProps> = ({ isOpen, onClose, location }) => {
  const { language, locale, t } = useLanguage();
  if (!isOpen) return null;

  const { angle, cardinal } = getQiblaInfo(location);
  const distanceKm = getDistanceKm(location.latitude, location.longitude, 21.4225, 39.8262);
  const localizedLocation = formatLocationDisplay(location, language);
  const localizedCardinal = t.qibla.directions[cardinal as keyof typeof t.qibla.directions] || cardinal;
  const localizedAngle = angle.toLocaleString(locale);
  const localizedDistance = distanceKm.toLocaleString(locale);
  const directionDisplay = `${localizedAngle}° ${localizedCardinal}`;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel max-w-md" role="dialog" aria-modal="true" aria-labelledby="qibla-title">
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[0.7rem_0.7rem_0.25rem_0.25rem] bg-primary text-white">
              <Compass className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
            </div>
            <div>
              <h2 id="qibla-title" className="text-lg font-semibold tracking-[-0.025em] text-foreground">
                {t.qiblaDirection}
              </h2>
              <p className="mt-0.5 text-xs text-foreground/50">{t.qibla.from.replace('{location}', localizedLocation)}</p>
            </div>
          </div>
          <button id="btn-close-qibla-modal" type="button" onClick={onClose} className="icon-button" aria-label={t.qibla.close}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          <div className="relative mx-auto grid aspect-square w-full max-w-[17rem] place-items-center overflow-hidden rounded-full border border-white/10 bg-[#0c2630] text-white shadow-[inset_0_0_0_1.25rem_rgba(255,255,255,0.025)]">
            <div className="absolute inset-5 rounded-full border border-dashed border-white/16" aria-hidden="true" />
            <div className="absolute inset-10 rounded-full border border-white/8" aria-hidden="true" />

            <span className="absolute top-4 text-[0.65rem] font-semibold text-accent">{t.qibla.directions.N}</span>
            <span className="absolute end-4 text-[0.65rem] font-semibold text-white/45">{t.qibla.directions.E}</span>
            <span className="absolute bottom-4 text-[0.65rem] font-semibold text-white/45">{t.qibla.directions.S}</span>
            <span className="absolute start-4 text-[0.65rem] font-semibold text-white/45">{t.qibla.directions.W}</span>

            <div
              className="absolute inset-5 transition-transform duration-700 ease-out motion-reduce:transition-none"
              style={{ transform: `rotate(${angle}deg)` }}
              aria-hidden="true"
            >
              <div className="flex h-full flex-col items-center justify-between py-3">
                <div className="flex flex-col items-center">
                  <span className="grid h-7 w-7 place-items-center rounded-[0.25rem] border border-accent/65 bg-accent text-sm text-[#0c2630] shadow-[0_0_0_4px_rgba(200,163,91,0.12)]">◆</span>
                  <span className="h-12 w-0.5 rounded-full bg-accent" />
                </div>
                <span className="h-7 w-0.5 rounded-full bg-white/18" />
              </div>
            </div>

            <div className="relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 border-[#0c2630] bg-white text-xs font-bold text-primary shadow-lg">
              •
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 divide-x divide-muted-border border-y border-muted-border py-4 text-center">
            <div className="px-3">
              <span className="block text-[0.68rem] text-foreground/45">{t.qibla.angle}</span>
              <strong className="mt-1 block font-mono text-xl font-semibold tracking-[-0.04em] text-foreground" dir="auto">
                {directionDisplay}
              </strong>
            </div>
            <div className="px-3">
              <span className="block text-[0.68rem] text-foreground/45">{t.qibla.distance}</span>
              <strong className="mt-1 block font-mono text-xl font-semibold tracking-[-0.04em] text-foreground" dir="auto">
                {localizedDistance} {t.qibla.km}
              </strong>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2.5 text-xs leading-5 text-foreground/52">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <p>
              {t.qibla.instruction.replace('{direction}', directionDisplay)}
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button id="btn-close-qibla-footer" type="button" onClick={onClose} className="primary-button w-full">
            {t.qibla.closeCompass}
          </button>
        </div>
      </div>
    </div>
  );
};
