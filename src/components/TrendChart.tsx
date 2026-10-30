import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EmptyState } from '@/components/EmptyState'
import { Card } from '@/components/ui/card'

interface TrendChartProps {
  title: string
  data?: { label: string; value: number }[]
}

export function TrendChart({ title, data = [] }: TrendChartProps) {
  return (
    <Card className="p-5">
      <h3 className="mb-4 font-semibold">{title}</h3>
      {data.length === 0 ? (
        <EmptyState
          className="border-0 bg-secondary/40 py-10"
          title="Trend data will appear after AI analysis."
          description="Charts stay empty until authorized messages are processed by the NLP/ML service."
        />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e2ec" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2A9D8F" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
