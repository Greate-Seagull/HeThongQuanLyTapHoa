import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Plus, Edit, Trash2, Search, ChevronRight, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/services/api-client';

interface Slot {
  id: number;
  name: string;
  rackId: number;
}

interface Rack {
  id: number;
  name: string;
  shelfId: number;
  slots: Slot[];
}

interface Shelf {
  id: number;
  name: string;
  racks: Rack[];
}

interface ApiResponse {
  status: string;
  data: Shelf[];
}

export function LocationManagement() {
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isShelfDialogOpen, setIsShelfDialogOpen] = useState(false);
  const [isRackDialogOpen, setIsRackDialogOpen] = useState(false);
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  
  const [editingShelf, setEditingShelf] = useState<Shelf | null>(null);
  const [editingRack, setEditingRack] = useState<Rack | null>(null);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ 
    open: boolean; 
    type: 'shelf' | 'rack' | 'slot'; 
    id: number; 
    name: string;
    warning?: string;
  }>({
    open: false,
    type: 'shelf',
    id: 0,
    name: '',
  });
  
  const [shelfFormData, setShelfFormData] = useState({ name: '' });
  const [rackFormData, setRackFormData] = useState({ name: '', shelfId: 0 });
  const [slotFormData, setSlotFormData] = useState({ name: '', rackId: 0 });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<ApiResponse>('/shelves');
      setShelves(response);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu vị trí');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Flatten data for easy access
  const getAllRacks = (): Rack[] => {
    return shelves.flatMap(shelf => shelf.racks);
  };

  const getAllSlots = (): Slot[] => {
    return shelves.flatMap(shelf => 
      shelf.racks.flatMap(rack => rack.slots)
    );
  };

  const getRackWithShelf = (rackId: number) => {
    for (const shelf of shelves) {
      const rack = shelf.racks.find(r => r.id === rackId);
      if (rack) return { rack, shelf };
    }
    return null;
  };

  const getSlotWithRackAndShelf = (slotId: number) => {
    for (const shelf of shelves) {
      for (const rack of shelf.racks) {
        const slot = rack.slots.find(s => s.id === slotId);
        if (slot) return { slot, rack, shelf };
      }
    }
    return null;
  };

  // Shelf handlers
  const handleAddShelf = () => {
    setEditingShelf(null);
    setShelfFormData({ name: '' });
    setIsShelfDialogOpen(true);
  };

  const handleEditShelf = (shelf: Shelf) => {
    setEditingShelf(shelf);
    setShelfFormData({ name: shelf.name });
    setIsShelfDialogOpen(true);
  };

  const handleDeleteShelf = (id: number, name: string) => {
    setDeleteConfirm({ 
      open: true, 
      type: 'shelf', 
      id, 
      name,
      warning: 'Tất cả ngăn và ô thuộc kệ này sẽ bị xóa.'
    });
  };

  const handleSaveShelf = async () => {
    try {
      if (editingShelf) {
        // TODO: Call PUT API
        // await fetch(`YOUR_API_ENDPOINT_HERE/shelves/${editingShelf.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ name: shelfFormData.name })
        // });
        
        setShelves(shelves.map(shelf =>
          shelf.id === editingShelf.id ? { ...shelf, name: shelfFormData.name } : shelf
        ));
      } else {
        // TODO: Call POST API
        // const response = await fetch('YOUR_API_ENDPOINT_HERE/shelves', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ name: shelfFormData.name })
        // });
        // const newShelf = await response.json();
        
        const newId = Math.max(...shelves.map(s => s.id), 0) + 1;
        setShelves([...shelves, { id: newId, name: shelfFormData.name, racks: [] }]);
      }
      setIsShelfDialogOpen(false);
    } catch (err) {
      console.error('Error saving shelf:', err);
      alert('Không thể lưu kệ');
    }
  };

  // Rack handlers
  const handleAddRack = () => {
    setEditingRack(null);
    setRackFormData({ name: '', shelfId: shelves[0]?.id || 0 });
    setIsRackDialogOpen(true);
  };

  const handleEditRack = (rack: Rack) => {
    setEditingRack(rack);
    setRackFormData({ name: rack.name, shelfId: rack.shelfId });
    setIsRackDialogOpen(true);
  };

  const handleDeleteRack = (id: number, name: string) => {
    setDeleteConfirm({ 
      open: true, 
      type: 'rack', 
      id, 
      name,
      warning: 'Tất cả ô thuộc ngăn này sẽ bị xóa.'
    });
  };

  const handleSaveRack = async () => {
    try {
      if (editingRack) {
        // TODO: Call PUT API
        setShelves(shelves.map(shelf => ({
          ...shelf,
          racks: shelf.racks.map(rack =>
            rack.id === editingRack.id
              ? { ...rack, name: rackFormData.name, shelfId: rackFormData.shelfId }
              : rack
          )
        })));
      } else {
        // TODO: Call POST API
        const newId = Math.max(...getAllRacks().map(r => r.id), 0) + 1;
        setShelves(shelves.map(shelf =>
          shelf.id === rackFormData.shelfId
            ? {
                ...shelf,
                racks: [...shelf.racks, { 
                  id: newId, 
                  name: rackFormData.name, 
                  shelfId: rackFormData.shelfId,
                  slots: []
                }]
              }
            : shelf
        ));
      }
      setIsRackDialogOpen(false);
    } catch (err) {
      console.error('Error saving rack:', err);
      alert('Không thể lưu ngăn');
    }
  };

  // Slot handlers
  const handleAddSlot = () => {
    setEditingSlot(null);
    const allRacks = getAllRacks();
    setSlotFormData({ name: '', rackId: allRacks[0]?.id || 0 });
    setIsSlotDialogOpen(true);
  };

  const handleEditSlot = (slot: Slot, rackId: number) => {
    setEditingSlot(slot);
    setSlotFormData({ name: slot.name, rackId });
    setIsSlotDialogOpen(true);
  };

  const handleDeleteSlot = (id: number, name: string) => {
    setDeleteConfirm({ 
      open: true, 
      type: 'slot', 
      id, 
      name 
    });
  };

  const handleSaveSlot = async () => {
    try {
      if (editingSlot) {
        // TODO: Call PUT API
        setShelves(shelves.map(shelf => ({
          ...shelf,
          racks: shelf.racks.map(rack => ({
            ...rack,
            slots: rack.slots.map(slot =>
              slot.id === editingSlot.id
                ? { ...slot, name: slotFormData.name, rackId: slotFormData.rackId }
                : slot
            )
          }))
        })));
      } else {
        // TODO: Call POST API
        const newId = Math.max(...getAllSlots().map(s => s.id), 0) + 1;
        setShelves(shelves.map(shelf => ({
          ...shelf,
          racks: shelf.racks.map(rack =>
            rack.id === slotFormData.rackId
              ? {
                  ...rack,
                  slots: [...rack.slots, { 
                    id: newId, 
                    name: slotFormData.name, 
                    rackId: slotFormData.rackId 
                  }]
                }
              : rack
          )
        })));
      }
      setIsSlotDialogOpen(false);
    } catch (err) {
      console.error('Error saving slot:', err);
      alert('Không thể lưu ô');
    }
  };

  const confirmDelete = async () => {
    const { type, id } = deleteConfirm;
    
    try {
      if (type === 'shelf') {
        // TODO: Call DELETE API
        // await fetch(`YOUR_API_ENDPOINT_HERE/shelves/${id}`, { method: 'DELETE' });
        setShelves(shelves.filter(shelf => shelf.id !== id));
      } else if (type === 'rack') {
        // TODO: Call DELETE API
        setShelves(shelves.map(shelf => ({
          ...shelf,
          racks: shelf.racks.filter(rack => rack.id !== id)
        })));
      } else if (type === 'slot') {
        // TODO: Call DELETE API
        setShelves(shelves.map(shelf => ({
          ...shelf,
          racks: shelf.racks.map(rack => ({
            ...rack,
            slots: rack.slots.filter(slot => slot.id !== id)
          }))
        })));
      }
      setDeleteConfirm({ open: false, type: 'shelf', id: 0, name: '' });
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Không thể xóa');
    }
  };

  const filteredSlots = getAllSlots().filter(slot => {
    const slotInfo = getSlotWithRackAndShelf(slot.id);
    if (!slotInfo) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      slot.name.toLowerCase().includes(searchLower) ||
      slotInfo.rack.name.toLowerCase().includes(searchLower) ||
      slotInfo.shelf.name.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        {error}
        <Button 
          onClick={fetchLocations} 
          className="ml-4 bg-blue-600 hover:bg-blue-700"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kệ */}
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-blue-900">Quản Lý Kệ</CardTitle>
            <Button onClick={handleAddShelf} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Thêm kệ
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="border border-blue-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-blue-900">ID</TableHead>
                  <TableHead className="text-blue-900">Tên kệ</TableHead>
                  <TableHead className="text-blue-900 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shelves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
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
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteShelf(shelf.id, shelf.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
          <div className="flex justify-between items-center">
            <CardTitle className="text-blue-900">Quản Lý Ngăn</CardTitle>
            <Button onClick={handleAddRack} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Thêm ngăn
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="border border-blue-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-blue-900">ID</TableHead>
                  <TableHead className="text-blue-900">Tên ngăn</TableHead>
                  <TableHead className="text-blue-900">Thuộc kệ</TableHead>
                  <TableHead className="text-blue-900 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getAllRacks().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Chưa có ngăn nào
                    </TableCell>
                  </TableRow>
                ) : (
                  getAllRacks().map((rack) => {
                    const shelf = shelves.find(s => s.id === rack.shelfId);
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
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRack(rack.id, rack.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
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
          <div className="flex justify-between items-center">
            <CardTitle className="text-blue-900">Quản Lý Ô</CardTitle>
            <Button onClick={handleAddSlot} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Thêm ô
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2 flex-1 max-w-md">
              <Input
                placeholder="Tìm kiếm ô..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-blue-200"
              />
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="border border-blue-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="text-blue-900">ID</TableHead>
                  <TableHead className="text-blue-900">Tên ô</TableHead>
                  <TableHead className="text-blue-900">Vị trí</TableHead>
                  <TableHead className="text-blue-900 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSlots.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      Không tìm thấy ô
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSlots.map((slot) => {
                    const slotInfo = getSlotWithRackAndShelf(slot.id);
                    if (!slotInfo) return null;
                    
                    return (
                      <TableRow key={slot.id} className="hover:bg-blue-50">
                        <TableCell>{slot.id}</TableCell>
                        <TableCell>{slot.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-gray-600">{slotInfo.shelf.name}</span>
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{slotInfo.rack.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSlot(slot, slotInfo.rack.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSlot(slot.id, slot.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
            <Button variant="outline" onClick={() => setIsShelfDialogOpen(false)} className="border-blue-200">
              Hủy
            </Button>
            <Button onClick={handleSaveShelf} className="bg-blue-600 hover:bg-blue-700">
              Lưu
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
                onValueChange={(value) => setRackFormData({ ...rackFormData, shelfId: parseInt(value) })}
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
            <Button variant="outline" onClick={() => setIsRackDialogOpen(false)} className="border-blue-200">
              Hủy
            </Button>
            <Button onClick={handleSaveRack} className="bg-blue-600 hover:bg-blue-700">
              Lưu
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
                onValueChange={(value) => setSlotFormData({ ...slotFormData, rackId: parseInt(value) })}
              >
                <SelectTrigger className="border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAllRacks().map((rack) => {
                    const shelf = shelves.find(s => s.id === rack.shelfId);
                    return (
                      <SelectItem key={rack.id} value={rack.id.toString()}>
                        {shelf?.name} - {rack.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSlotDialogOpen(false)} className="border-blue-200">
              Hủy
            </Button>
            <Button onClick={handleSaveSlot} className="bg-blue-600 hover:bg-blue-700">
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => !open && setDeleteConfirm({ open: false, type: 'shelf', id: 0, name: '' })}
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
  );
}