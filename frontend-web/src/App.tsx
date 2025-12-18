import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Card } from './components/Card'
import { Button } from './components/Button'

interface Item {
  id: number
  name: string
  description: string
  created_at: string
}

const fetchItems = async (): Promise<Item[]> => {
  const { data } = await axios.get('/api/items/')
  return data.results || data
}

function App() {
  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
  })

  if (isLoading) return <div className="p-8">Cargando...</div>
  if (error) return <div className="p-8 text-red-500">Error al cargar datos</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Auditoria</h1>
        
        <div className="mb-6">
          <Button>Nuevo Item</Button>
        </div>

        <div className="grid gap-4">
          {items?.map((item) => (
            <Card key={item.id}>
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-gray-600">{item.description}</p>
              <p className="text-sm text-gray-400 mt-2">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App