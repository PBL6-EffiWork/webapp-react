import { useEffect } from 'react'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { loadAllMembersThunk } from '../../../redux/board/boardSlice'
import ManagerMembersTable from './table'

export default function UsersPage() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(loadAllMembersThunk())
  }, [dispatch])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">User Management</h1>
      <ManagerMembersTable />
    </div>
  )
}

