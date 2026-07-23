import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchAppData } from '../services/database'
import { supabase } from '../services/supabase'

export function useAppData() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const client = supabase
    if (!client) return

    const channel = client
      .channel('public-attendance-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => {
        void queryClient.invalidateQueries({ queryKey: ['umara-dashboard'] })
      })
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [queryClient])

  return useQuery({
    queryKey: ['umara-dashboard'],
    queryFn: fetchAppData,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  })
}
