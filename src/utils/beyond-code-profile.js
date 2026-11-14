/** Development-only, bounded frame sampling. Measures JS and frame cadence,
 * not compositor/paint time or a guaranteed rate on other devices. */
export function createFrameProfile(label, sampleCount = 180) {
  let warmup = 30;
  let previous = 0;
  let reports = 0;
  let samples = [];
  const percentile = (values, fraction) => {
    const sorted = [...values].sort((a, b) => a - b);
    return Number(sorted[Math.floor((sorted.length - 1) * fraction)].toFixed(3));
  };
  return {
    record(now, physicsMs, renderMs, visibleNodes) {
      const interval = previous ? now - previous : 0;
      previous = now;
      if (reports >= 2 || !interval || interval > 200) return;
      if (warmup > 0) { warmup--; return; }
      samples.push({ interval, physicsMs, renderMs });
      if (samples.length < sampleCount) return;
      const sum = samples.reduce((total, sample) => total + sample.interval, 0);
      console.info('[beyond-profile]', JSON.stringify({ label, visibleNodes,
        frames: samples.length, fps: Number((samples.length * 1000 / sum).toFixed(2)),
        intervalP50: percentile(samples.map((sample) => sample.interval), .5),
        intervalP95: percentile(samples.map((sample) => sample.interval), .95),
        physicsP95: percentile(samples.map((sample) => sample.physicsMs), .95),
        renderP95: percentile(samples.map((sample) => sample.renderMs), .95),
      }));
      samples = [];
      reports++;
    },
  };
}
