import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Search, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Shelf {
  id: number;
  name: string;
}

interface Rack {
  id: number;
  name: string;
  shelfId: number;
  shelf: Shelf;
}

interface Slot {
  id: number;
  name: string;
  rackId: number;
  rack: Rack;
}

const mockShelves: Shelf[] = [
  { id: 1, name: 'Kệ A' },
  { id: 2, name: 'Kệ B' },
  { id: 3, name: 'Kệ C' },
];

const mockRacks: Rack[] = [
  { id: 1, name: 'Ngăn 1', shelfId: 1, shelf: mockShelves[0] },
  { id: 2, name: 'Ngăn 2', shelfId: 1, shelf: mockShelves[0] },
  { id: 3, name: 'Ngăn 1', shelfId: 2, shelf: mockShelves[1] },
  { id: 4, name: 'Ngăn 2', shelfId: 2, shelf: mockShelves[1] },
];

const mockSlots: Slot[] = [
  { id: 1, name: 'Ô A', rackId: 1, rack: mockRacks[0] },
  { id: 2, name: 'Ô B', rackId: 1, rack: mockRacks[0] },
  { id: 3, name: 'Ô C', rackId: 1, rack: mockRacks[0] },
  { id: 4, name: 'Ô A', rackId: 2, rack: mockRacks[1] },
  { id: 5, name: 'Ô B', rackId: 2, rack: mockRacks[1] },
  { id: 6, name: 'Ô A', rackId: 3, rack: mockRacks[2] },
];

export function LocationManagement() {
  const [shelves, setShelves] = useState<Shelf[]>(mockShelves);
  const [racks, setRacks] = useState<Rack[]>(mockRacks);
  const [slots, setSlots] = useState<Slot[]>(mockSlots);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isShelfDialogOpen, setIsShelfDialogOpen] = useState(false);
  const [isRackDialogOpen, setIsRackDialogOpen] = useState(false);
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
  
  const [editingShelf, setEditingShelf] = useState<Shelf | null>(null);
  const [editingRack, setEditingRack] = useState<Rack | null>(null);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  
  const [shelfFormData, setShelfFormData] = useState({ name: '' });
  const [rackFormData, setRackFormData] = useState({ name: '', shelfId: 0 });
  const [slotFormData, setSlotFormData] = useState({ name: '', rackId: 0 });

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

  const handleDeleteShelf = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa kệ này? Tất cả ngăn và ô thuộc kệ này sẽ bị xóa.')) {
      setShelves(shelves.filter(shelf => shelf.id !== id));
      const rackIds = racks.filter(r => r.shelfId === id).map(r => r.id);
      setRacks(racks.filter(r => r.shelfId !== id));
      setSlots(slots.filter(s => !rackIds.includes(s.rackId)));
    }
  };

  const handleSaveShelf = () => {
    if (editingShelf) {
      setShelves(shelves.map(shelf =>
        shelf.id === editingShelf.id ? { ...shelf, name: shelfFormData.name } : shelf
      ));
    } else {
      const newId = Math.max(...shelves.map(s => s.id), 0) + 1;
      setShelves([...shelves, { id: newId, name: shelfFormData.name }]);
    }
    setIsShelfDialogOpen(false);
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

  const handleDeleteRack = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa ngăn này? Tất cả ô thuộc ngăn này sẽ bị xóa.')) {
      setRacks(racks.filter(rack => rack.id !== id));
      setSlots(slots.filter(s => s.rackId !== id));
    }
  };

  const handleSaveRack = () => {
    const shelf = shelves.find(s => s.id === rackFormData.shelfId);
    if (!shelf) return;

    if (editingRack) {
      setRacks(racks.map(rack =>
        rack.id === editingRack.id 
          ? { ...rack, name: rackFormData.name, shelfId: rackFormData.shelfId, shelf }
          : rack
      ));
    } else {
      const newId = Math.max(...racks.map(r => r.id), 0) + 1;
      setRacks([...racks, { id: newId, name: rackFormData.name, shelfId: rackFormData.shelfId, shelf }]);
    }
    setIsRackDialogOpen(false);
  };

  // Slot handlers
  const handleAddSlot = () => {
    setEditingSlot(null);
    setSlotFormData({ name: '', rackId: racks[0]?.id || 0 });
    setIsSlotDialogOpen(true);
  };

  const handleEditSlot = (slot: Slot) => {
    setEditingSlot(slot);
    setSlotFormData({ name: slot.name, rackId: slot.rackId });
    setIsSlotDialogOpen(true);
  };

  const handleDeleteSlot = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa ô này?')) {
      setSlots(slots.filter(slot => slot.id !== id));
    }
  };

  const handleSaveSlot = () => {
    const rack = racks.find(r => r.id === slotFormData.rackId);
    if (!rack) return;

    if (editingSlot) {
      setSlots(slots.map(slot =>
        slot.id === editingSlot.id 
          ? { ...slot, name: slotFormData.name, rackId: slotFormData.rackId, rack }
          : slot
      ));
    } else {
      const newId = Math.max(...slots.map(s => s.id), 0) + 1;
      setSlots([...slots, { id: newId, name: slotFormData.name, rackId: slotFormData.rackId, rack }]);
    }
    setIsSlotDialogOpen(false);
  };

  const filteredSlots = slots.filter(slot =>
    slot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.rack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.rack.shelf.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                {shelves.map((shelf) => (
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
                        onClick={() => handleDeleteShelf(shelf.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
                {racks.map((rack) => (
                  <TableRow key={rack.id} className="hover:bg-blue-50">
                    <TableCell>{rack.id}</TableCell>
                    <TableCell>{rack.name}</TableCell>
                    <TableCell>{rack.shelf.name}</TableCell>
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
                        onClick={() => handleDeleteRack(rack.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
                {filteredSlots.map((slot) => (
                  <TableRow key={slot.id} className="hover:bg-blue-50">
                    <TableCell>{slot.id}</TableCell>
                    <TableCell>{slot.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-600">{slot.rack.shelf.name}</span>
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">{slot.rack.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditSlot(slot)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
                  {racks.map((rack) => (
                    <SelectItem key={rack.id} value={rack.id.toString()}>
                      {rack.shelf.name} - {rack.name}
                    </SelectItem>
                  ))}
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
    </div>
  );
}
