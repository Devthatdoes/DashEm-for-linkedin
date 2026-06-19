import { browser } from "wxt/browser";
import { classify, PACKS, type TonePack } from "@/core/bands";
import { getSettings, setSettings } from "@/lib/settings";

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`#${id} missing`);
  return node as T;
}

async function init(): Promise<void> {
  const s = await getSettings();

  const enabled = el<HTMLInputElement>("enabled");
  const threshold = el<HTMLInputElement>("threshold");
  const thresholdVal = el<HTMLSpanElement>("thresholdVal");
  const showPercent = el<HTMLInputElement>("showPercent");
  const tonePack = el<HTMLSelectElement>("tonePack");

  enabled.checked = s.enabled;
  threshold.value = String(s.threshold);
  showPercent.checked = s.showPercent;
  tonePack.value = s.tonePack;

  const reflect = () => {
    const v = Number(threshold.value);
    const band = classify(v, PACKS[tonePack.value as TonePack]);
    thresholdVal.textContent = `${v}% — ${band.emoji} ${band.label}`.trim();
  };
  reflect();

  enabled.addEventListener("change", () => setSettings({ enabled: enabled.checked }));
  showPercent.addEventListener("change", () => setSettings({ showPercent: showPercent.checked }));
  tonePack.addEventListener("change", () => {
    setSettings({ tonePack: tonePack.value as TonePack });
    reflect();
  });
  threshold.addEventListener("input", reflect);
  threshold.addEventListener("change", () => setSettings({ threshold: Number(threshold.value) }));

  const stats = (await browser.storage.session.get("stats")).stats as
    | { seen: number; flagged: number }
    | undefined;
  el<HTMLSpanElement>("seen").textContent = String(stats?.seen ?? 0);
  el<HTMLSpanElement>("flagged").textContent = String(stats?.flagged ?? 0);
}

init();
