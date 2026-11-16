// Preline Charts uses ApexCharts 4.7. https://preline.co/docs/components/charts.html
window.addEventListener('load', async () => {
  const data = JSON.parse(document.getElementById('benchmark-data').textContent);
  const colors = ['#2563eb', '#eab308', '#ef4444', '#9ca3af'];
  const base = {
    chart: {height: 220, fontFamily: 'ui-sans-serif, system-ui, sans-serif', toolbar: {show: false}, animations: {enabled: false}},
    colors, dataLabels: {enabled: false}, stroke: {width: 0},
    legend: {position: 'bottom', fontSize: '13px'},
    grid: {borderColor: '#e5e7eb', strokeDashArray: 4},
    tooltip: {theme: 'light'},
    noData: {text: '暂无数据'}
  };
  const render = async (id, options) => {
    const chart = new ApexCharts(document.getElementById(id), {
      ...base, ...options, chart: {...base.chart, ...options.chart}
    });
    await chart.render();
  };
  const distribution = data.duration_distribution;
  await render('duration-chart', {
    chart: {type: 'bar', height: 240},
    series: [{name: '题数占比', data: distribution.percentages}],
    xaxis: {categories: distribution.labels, title: {text: '耗时区间'}},
    yaxis: {min: 0, max: 100, labels: {formatter: value => value.toFixed(0) + '%'}, title: {text: '题数占比'}},
    tooltip: {y: {formatter: (value, {dataPointIndex}) => distribution.counts[dataPointIndex] + ' 题 · ' + value.toFixed(1) + '%'}},
    plotOptions: {bar: {horizontal: false, columnWidth: '45%', borderRadius: 4}}
  });
  let comparisonChart;
  const compare = async () => {
    const baseline = data.history.find(r => r.id === data.default_baseline);
    const candidate = data.history.find(r => r.id === data.current);
    const empty = document.getElementById('comparison-empty');
    if (!baseline || !candidate || baseline.id === candidate.id) {
      if (comparisonChart) { comparisonChart.destroy(); comparisonChart = null; }
      document.getElementById('comparison-mode').textContent = '';
      document.getElementById('comparison-mode').classList.add('hidden');
      document.getElementById('comparison-chart').classList.add('hidden');
      document.getElementById('comparison-metrics').classList.add('hidden');
      empty.textContent = '暂无同题单的其他 Agent 版本';
      return;
    }
    empty.textContent = '';
    document.getElementById('comparison-mode').classList.remove('hidden');
    document.getElementById('comparison-chart').classList.remove('hidden');
    document.getElementById('comparison-metrics').classList.remove('hidden');
    document.getElementById('comparison-mode').textContent =
      (baseline.config === candidate.config ? '同配置重复测试' : 'Agent 配置对照') +
      ' · 正确率变化 ' + (candidate.accuracy - baseline.accuracy).toFixed(1) + ' pp' +
      ' · 耗时变化 ' + (candidate.seconds != null && baseline.seconds != null ? (candidate.seconds - baseline.seconds).toFixed(1) : '—') + ' s';
    if (comparisonChart) comparisonChart.destroy();
    const runs = [baseline, candidate];
    const metrics = [
      {name: '正确率', unit: '%', values: runs.map(run => run.accuracy)},
      {name: '异常率', unit: '%', values: runs.map(run => 100 * run.values[2] / run.values.reduce((a, b) => a + b, 0))},
      ...[['seconds', '耗时', 's'], ['tokens', 'Token', ''], ['requests', 'LLM 请求', '次'], ['tools', '工具执行', '次']]
        .map(([key, name, unit]) => ({name, unit, values: runs.map(run => run[key] ?? null)}))
    ];
    const format = value => value == null ? '—' : Number(value.toFixed(1)).toLocaleString('zh-CN');
    comparisonChart = new ApexCharts(document.getElementById('comparison-chart'), {
      ...base, chart: {...base.chart, type: 'line', height: 280},
      series: metrics.map(metric => {
        const maximum = Math.max(...metric.values.filter(value => value != null));
        return {name: metric.name, data: metric.values.map(value => value == null ? null : maximum > 0 ? value / maximum * 100 : 0)};
      }),
      colors: ['#2563eb', '#ef4444', '#14b8a6', '#eab308', '#8b5cf6', '#06b6d4'],
      stroke: {width: 2, curve: 'straight'}, markers: {size: 4},
      xaxis: {categories: runs.map(run => run.name)},
      yaxis: {min: 0, max: 100, title: {text: '相对值 · 各指标最大值 = 100'}, labels: {formatter: value => value.toFixed(0)}},
      tooltip: {shared: true, y: {formatter: (value, {seriesIndex, dataPointIndex}) => {
        const metric = metrics[seriesIndex];
        return format(metric.values[dataPointIndex]) + (metric.values[dataPointIndex] == null ? '' : ' ' + metric.unit);
      }}}
    });
    await comparisonChart.render();
    const tbody = document.querySelector('#comparison-table tbody');
    tbody.replaceChildren();
    runs.forEach((run, index) => {
      const row = document.createElement('tr'); row.className = 'hover:bg-gray-50';
      const values = [run.name, ...metrics.map(metric => format(metric.values[index]) + (metric.unit === '%' && metric.values[index] != null ? '%' : ''))];
      values.forEach(value => {
        const cell = document.createElement('td');
        cell.className = 'px-3 py-2 whitespace-nowrap text-sm text-gray-800';
        cell.textContent = value; row.append(cell);
      });
      tbody.append(row);
    });
  };
  if (data.default_baseline) await compare();
  document.getElementById('rerun').addEventListener('click', async event => {
    const value = data.rerun;
    const button = event.currentTarget;
    const label = button.textContent;
    try {
      await navigator.clipboard.writeText(value);
      button.textContent = '已复制';
      button.disabled = true;
      setTimeout(() => {
        button.textContent = label;
        button.disabled = false;
      }, 2000);
    } catch (error) {
      if (error.name !== 'NotAllowedError' && error.name !== 'TypeError') throw error;
      const command = document.getElementById('rerun-command');
      command.textContent = value; command.classList.remove('hidden');
    }
  });
  document.documentElement.dataset.chartsReady = 'true';
});
