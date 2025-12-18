import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Edit, Trash2, Search, ChevronRight, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { apiClient } from '@/services/api-client'

interface SlotWithProduct {
  slotId: number;
  slotName: string;
  rackId: number;
  productId?: number;
  productName?: string;
}
import { toast } from 'sonner'
import { set } from 'react-hook-form'

interface Slot {
  id: number
  name: string
  rackId: number
}

interface Rack {
  id: number
  name: string
  shelfId: number
  slots: Slot[]
}

interface Shelf {
  id: number
  name: string
  racks: Rack[]
}

interface ApiResponse {
  status: string
  data: Shelf[]
}

export function LocationManagement() {
  const [shelves, setShelves] = useState<Shelf[]>([])
  const [slotsWithProduct, setSlotsWithProduct] = useState<SlotWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [isShelfDialogOpen, setIsShelfDialogOpen] = useState(false)
  const [isRackDialogOpen, setIsRackDialogOpen] = useState(false)
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false)

  const [editingShelf, setEditingShelf] = useState<Shelf | null>(null)
  const [editingRack, setEditingRack] = useState<Rack | null>(null)
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null)

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    type: 'shelf' | 'rack' | 'slot'
    id: number
    name: string
    warning?: string
  }>({
    open: false,
    type: 'shelf',
    id: 0,
    name: '',
  })

  const [shelfFormData, setShelfFormData] = useState({ name: '' })
  const [rackFormData, setRackFormData] = useState({ name: '', shelfId: 0 })
  const [slotFormData, setSlotFormData] = useState({ name: '', rackId: 0 })
  const [isSavingShelf, setIsSavingShelf] = useState(false)
  const [isSavingRack, setIsSavingRack] = useState(false)
  const [isSavingSlot, setIsSavingSlot] = useState(false)
  useEffect(() => {
    fetchLocations()
    fetchSlotsWithProduct()
  }, [])

  const fetchSlotsWithProduct = async () => {
    try {
      const data = await apiClient.get<SlotWithProduct[]>('/slots/list-with-product')
      setSlotsWithProduct(data)
    } catch (err) {
      setSlotsWithProduct([])
    }
  }

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response: Shelf[] = await apiClient.get('/shelves') // Bỏ <ApiResponse>

      // response đã là array Shelf[] luôn, không cần .data
      const sortedData = response
        .map((shelf: Shelf) => ({
          ...shelf,
          racks: shelf.racks
            .map((rack) => ({
              ...rack,
              slots: rack.slots.sort((a, b) => b.id - a.id),
            }))
            .sort((a, b) => b.id - a.id),
        }))
        .sort((a, b) => b.id - a.id)
      setShelves(sortedData)
      setError(null)
    } catch (err) {
      setError('Không thể tải dữ liệu vị trí')
      console.error('Error fetching locations:', err)
    } finally {
      setLoading(false)
    }
  }

  // Flatten data for easy access
  const getAllRacks = (): Rack[] => {
    return shelves.flatMap((shelf) => shelf.racks)
  }

  const getAllSlots = (): Slot[] => {
    return shelves.flatMap((shelf) => shelf.racks.flatMap((rack) => rack.slots))
  }

  const getRackWithShelf = (rackId: number) => {
    for (const shelf of shelves) {
      const rack = shelf.racks.find((r) => r.id === rackId)
      if (rack) return { rack, shelf }
    }
    return null
  }

  const getSlotWithRackAndShelf = (slotId: number) => {
    for (const shelf of shelves) {
      for (const rack of shelf.racks) {
        const slot = rack.slots.find((s) => s.id === slotId)
        if (slot) return { slot, rack, shelf }
      }
    }
    return null
  }

  // Shelf handlers
  const handleAddShelf = () => {
    setEditingShelf(null)
    setShelfFormData({ name: '' })
    setIsShelfDialogOpen(true)
  }

  const handleEditShelf = (shelf: Shelf) => {
    setEditingShelf(shelf)
    setShelfFormData({ name: shelf.name })
    setIsShelfDialogOpen(true)
  }

  const handleDeleteShelf = (id: number, name: string) => {
    setDeleteConfirm({
      open: true,
      type: 'shelf',
      id,
      name,
      warning: 'Tất cả ngăn và ô thuộc kệ này sẽ bị xóa.',
    })
  }

  const handleSaveShelf = async () => {
    setIsSavingShelf(true)
    try {
      if (editingShelf) {
        // TODO: Call PUT API
        const data = await apiClient.put<Shelf>(`/shelves/${editingShelf.id}`, {
          name: shelfFormData.name,
        })
        if (data) {
          fetchLocations()
        }
        toast.success('Kệ đã được cập nhật thành công')
      } else {
        // TODO: Call POST API
        const data = await apiClient.post<Shelf>('/shelves', { name: shelfFormData.name })
        if (data) {
          fetchLocations()
          toast.success('Kệ đã được tạo thành công')
        }
      }
      setIsShelfDialogOpen(false)
    } catch (err) {
      console.error('Error saving shelf:', err)
      toast.error('Không thể lưu kệ')
    } finally {
      setIsSavingShelf(false)
    }
  }

  // Rack handlers
  const handleAddRack = () => {
    setEditingRack(null)
    setRackFormData({ name: '', shelfId: shelves[0]?.id || 0 })
    setIsRackDialogOpen(true)
  }

  const handleEditRack = (rack: Rack) => {
    setEditingRack(rack)
    setRackFormData({ name: rack.name, shelfId: rack.shelfId })
    setIsRackDialogOpen(true)
  }

  const handleDeleteRack = (id: number, name: string) => {
    setDeleteConfirm({
      open: true,
      type: 'rack',
      id,
      name,
      warning: 'Tất cả ô thuộc ngăn này sẽ bị xóa.',
    })
  }

  const handleSaveRack = async () => {
    setIsSavingRack(true)
    try {
      if (editingRack) {
        const data = await apiClient.put<Rack>(`/racks/${editingRack.id}`, {
          name: rackFormData.name,
          shelfId: rackFormData.shelfId,
        })
        if (data) {
          toast.success('Ngăn đã được cập nhật thành công')
          fetchLocations()
        }
      } else {
        const data = await apiClient.post<Rack>('/racks', {
          name: rackFormData.name,
          shelfId: rackFormData.shelfId,
        })
        if (data) {
          toast.success('Ngăn đã được tạo thành công')
          fetchLocations()
        }
      }
      setIsRackDialogOpen(false)
    } catch (err) {
      console.error('Error saving rack:', err)
      toast.error('Không thể lưu ngăn')
    } finally {
      setIsSavingRack(false)
    }
  }

  // Slot handlers
  const handleAddSlot = () => {
    setEditingSlot(null)
    const allRacks = getAllRacks()
    setSlotFormData({ name: '', rackId: allRacks[0]?.id || 0 })
    setIsSlotDialogOpen(true)
  }

  const handleEditSlot = (slot: Slot, rackId: number) => {
    setEditingSlot(slot)
    setSlotFormData({ name: slot.name, rackId })
    setIsSlotDialogOpen(true)
  }

  const handleDeleteSlot = (id: number, name: string) => {
    setDeleteConfirm({
      open: true,
      type: 'slot',
      id,
      name,
    })
  }

  const handleSaveSlot = async () => {
    setIsSavingSlot(true)
    try {
      if (editingSlot) {
        const data = await apiClient.put<Slot>(`/slots/${editingSlot.id}`, {
          name: slotFormData.name,
          rackId: slotFormData.rackId,
        })
        if (data) {
          toast.success('Ô đã được cập nhật thành công')
          fetchLocations()
        }
      } else {
        const data = await apiClient.post<Slot>('/slots', {
          name: slotFormData.name,
          rackId: slotFormData.rackId,
        })
        if (data) {
          toast.success('Ô đã được tạo thành công')
          fetchLocations()
        }
      }
      setIsSlotDialogOpen(false)
    } catch (err) {
      console.error('Error saving slot:', err)
      toast.error('Không thể lưu ô')
    } finally {
      setIsSavingSlot(false)
    }
  }

  const confirmDelete = async () => {
    const { type, id } = deleteConfirm

    try {
      if (type === 'shelf') {
        // TODO: Call DELETE API
        const data = await apiClient.delete(`/shelves/${id}`)
        if (data) {
          toast.success('Kệ đã được xóa thành công')
          fetchLocations()
        }
      } else if (type === 'rack') {
        const data = await apiClient.delete(`/racks/${id}`)
        if (data) {
          toast.success('Ngăn đã được xóa thành công')
          fetchLocations()
        }
      } else if (type === 'slot') {
        const data = await apiClient.delete(`/slots/${id}`)
        if (data) {
          toast.success('Ô đã được xóa thành công')
          fetchLocations()
        }
      }
      setDeleteConfirm({ open: false, type: 'shelf', id: 0, name: '' })
    } catch (err) {
      console.error('Error deleting:', err)
      toast.error('Không thể xóa mục này do đang được sử dụng')
    }
  }

  // Filter slots with product info
  const filteredSlotsWithProduct = slotsWithProduct.filter((slot) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (slot.slotName?.toLowerCase().includes(searchLower) || "") ||
      (slot.productName?.toLowerCase().includes(searchLower) || "")
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center text-red-600">
        {error}
        <Button onClick={fetchLocations} className="ml-4 bg-blue-600 hover:bg-blue-700">
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Kệ */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-900">Quản Lý Kệ</CardTitle>
            <Button onClick={handleAddShelf} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Thêm kệ
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-hidden rounded-lg border border-blue-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-blue-900">ID</TableHead>
                  <TableHead className="text-blue-900">Tên kệ</TableHead>
                  <TableHead className="text-right text-blue-900">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shelves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-gray-500">
                      Chưa có kệ nào
                    </TableCell>
                  </TableRow>
                ) : (
                  shelves.map((shelf) => (
                    <TableRow key={shelf.id} className="hover:bg-blue-50">
                      <TableCell>{shelf.id}</TableCell>
                      <TableCell>{shelf.name}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditShelf(shelf)}
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteShelf(shelf.id, shelf.name)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Ngăn */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-900">Quản Lý Ngăn</CardTitle>
            <Button onClick={handleAddRack} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Thêm ngăn
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-hidden rounded-lg border border-blue-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-blue-900">ID</TableHead>
                  <TableHead className="text-blue-900">Tên ngăn</TableHead>
                  <TableHead className="text-blue-900">Thuộc kệ</TableHead>
                  <TableHead className="text-right text-blue-900">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getAllRacks().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                      Chưa có ngăn nào
                    </TableCell>
                  </TableRow>
                ) : (
                  getAllRacks().map((rack) => {
                    const shelf = shelves.find((s) => s.id === rack.shelfId)
                    return (
                      <TableRow key={rack.id} className="hover:bg-blue-50">
                        <TableCell>{rack.id}</TableCell>
                        <TableCell>{rack.name}</TableCell>
                        <TableCell>{shelf?.name || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRack(rack)}
                            className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRack(rack.id, rack.name)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Ô */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-900">Quản Lý Ô</CardTitle>
            <Button onClick={handleAddSlot} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Thêm ô
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex max-w-md flex-1 gap-2">
              <Input
                placeholder="Tìm kiếm ô hoặc sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-blue-200"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-blue-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-blue-900">ID</TableHead>
                  <TableHead className="text-blue-900">Tên ô</TableHead>
                  <TableHead className="text-blue-900">Tên sản phẩm</TableHead>
                  <TableHead className="text-right text-blue-900">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSlotsWithProduct.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-gray-500">
                      Không tìm thấy ô
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSlotsWithProduct.map((slot) => (
                    <TableRow key={slot.slotId} className="hover:bg-blue-50">
                      <TableCell>{slot.slotId}</TableCell>
                      <TableCell>{slot.slotName}</TableCell>
                      <TableCell>{slot.productName || '-'}</TableCell>
                      <TableCell className="text-right">
                        {/* You can add edit/delete actions here if needed */}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Shelf Dialog */}
      <Dialog open={isShelfDialogOpen} onOpenChange={setIsShelfDialogOpen}>
        <DialogContent className="border-blue-200">
          <DialogHeader>
            <DialogTitle className="text-blue-900">
              {editingShelf ? 'Sửa kệ' : 'Thêm kệ mới'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editingShelf ? 'Cập nhật thông tin kệ' : 'Tạo một kệ mới'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shelfName">Tên kệ</Label>
              <Input
                id="shelfName"
                value={shelfFormData.name}
                onChange={(e) => setShelfFormData({ name: e.target.value })}
                className="border-blue-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsShelfDialogOpen(false)}
              className="border-blue-200"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveShelf}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSavingShelf}
            >
              {isSavingShelf ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rack Dialog */}
      <Dialog open={isRackDialogOpen} onOpenChange={setIsRackDialogOpen}>
        <DialogContent className="border-blue-200">
          <DialogHeader>
            <DialogTitle className="text-blue-900">
              {editingRack ? 'Sửa ngăn' : 'Thêm ngăn mới'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editingRack ? 'Cập nhật thông tin ngăn' : 'Tạo một ngăn mới'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rackName">Tên ngăn</Label>
              <Input
                id="rackName"
                value={rackFormData.name}
                onChange={(e) => setRackFormData({ ...rackFormData, name: e.target.value })}
                className="border-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shelfId">Thuộc kệ</Label>
              <Select
                value={rackFormData.shelfId.toString()}
                onValueChange={(value) =>
                  setRackFormData({ ...rackFormData, shelfId: parseInt(value) })
                }
              >
                <SelectTrigger className="border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shelves.map((shelf) => (
                    <SelectItem key={shelf.id} value={shelf.id.toString()}>
                      {shelf.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRackDialogOpen(false)}
              className="border-blue-200"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveRack}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSavingRack}
            >
              {isSavingRack ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Slot Dialog */}
      <Dialog open={isSlotDialogOpen} onOpenChange={setIsSlotDialogOpen}>
        <DialogContent className="border-blue-200">
          <DialogHeader>
            <DialogTitle className="text-blue-900">
              {editingSlot ? 'Sửa ô' : 'Thêm ô mới'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editingSlot ? 'Cập nhật thông tin ô' : 'Tạo một ô mới'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slotName">Tên ô</Label>
              <Input
                id="slotName"
                value={slotFormData.name}
                onChange={(e) => setSlotFormData({ ...slotFormData, name: e.target.value })}
                className="border-blue-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rackId">Thuộc ngăn</Label>
              <Select
                value={slotFormData.rackId.toString()}
                onValueChange={(value) =>
                  setSlotFormData({ ...slotFormData, rackId: parseInt(value) })
                }
              >
                <SelectTrigger className="border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAllRacks().map((rack) => {
                    const shelf = shelves.find((s) => s.id === rack.shelfId)
                    return (
                      <SelectItem key={rack.id} value={rack.id.toString()}>
                        {shelf?.name} - {rack.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSlotDialogOpen(false)}
              className="border-blue-200"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveSlot}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSavingSlot}
            >
              {isSavingSlot ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) =>
          !open && setDeleteConfirm({ open: false, type: 'shelf', id: 0, name: '' })
        }
        title={`Xóa ${deleteConfirm.type === 'shelf' ? 'kệ' : deleteConfirm.type === 'rack' ? 'ngăn' : 'ô'} "${deleteConfirm.name}"?`}
        description={
          deleteConfirm.warning
            ? `Bạn có chắc chắn muốn xóa? ${deleteConfirm.warning}`
            : `Bạn có chắc chắn muốn xóa ${deleteConfirm.type === 'shelf' ? 'kệ' : deleteConfirm.type === 'rack' ? 'ngăn' : 'ô'} này?`
        }
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  )
}
