import { random } from 'lodash'

import api from './salesApi'
import { SalesDahsboardContextFilter } from './overviewContext'

export interface GetChartDataOptions {
  filter: SalesDahsboardContextFilter
}

export default {
  getRandomNumber(min = 0, max = 1): number {
    return random(min, max)
  },
  async getChartData({ filter }: GetChartDataOptions): Promise<Chart.ChartData> {
    interface ChartDataSet extends Chart.ChartDataSets {
      data: number[]
    }

    const orders = await api.orders.getSum({
      $select: [['func_sum', '']],
      $filter: {
        createdAt: {
          ge: filter.dateFrom,
          le: filter.dateTo,
        },
      },
      $groupBy: [['func_date_day', 'createdAt']],
    })

    //console.log('orders', orders)

    const labels: string[] = []

    const ordersCount: ChartDataSet = {
      type: 'line',
      label: 'Number of orders',
      backgroundColor: '#1e88e5',
      borderColor: '#1e88e5',
      fill: false,
      data: [],
    }
    const ordersSum: ChartDataSet = {
      type: 'line',
      label: 'Total orders $',
      backgroundColor: '#95de3c',
      borderColor: '#95de3c',
      fill: false,
      data: [],
      yAxisID: 'y-axis-2',
    }


    return {
      labels,
      datasets: [ordersSum, ordersCount], // signups
    }
  },
  getChartOptions(options: GetChartDataOptions): Chart.ChartOptions {
    const timeFormat = 'MM/DD/YYYY'

    return {
      // responsive: true,
      title: {
        text: 'Chart.js Combo Time Scale',
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            display: true,
            time: {
              parser: timeFormat,
            },
          },
        ],
        yAxes: [
          {
            type: 'linear',
            display: true,
            position: 'left',
            id: 'y-axis-1',
          },
          {
            type: 'linear',
            display: true,
            position: 'right',
            id: 'y-axis-2',
            // grid line settings
            gridLines: {
              drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
            ticks: {
              // Include a dollar sign in the ticks
              callback: function(value, index, values) {
                return '$' + value
              },
            },
          },
        ],
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'index',
        intersect: false,
      },
    }
  },
  // In real life this would be an http call
  async getChartConfiguration(
    options: GetChartDataOptions,
  ): Promise<Chart.ChartConfiguration> {
    const configuration = {
      type: 'bar',
      options: this.getChartOptions(options),
      data: await this.getChartData(options),
    }

    return new Promise(resolve => setTimeout(() => resolve(configuration), 300))
  },
}
