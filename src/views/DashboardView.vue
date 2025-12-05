<script setup lang="ts">
import { ref } from 'vue'
import ChartAreaInteractive from '@/components/ChartAreaInteractive.vue'
import DataTable from '@/components/DataTable.vue'
import SectionCards from '@/components/SectionCards.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import { SidebarInset } from '@/components/ui/sidebar'

// Datos de ejemplo para la tabla
const tableData = ref([
  {
    id: 1,
    header: 'Introduction',
    type: 'Documentation',
    status: 'Done',
    target: 'All users',
    limit: 'No limit',
    reviewer: 'John Doe',
  },
  {
    id: 2,
    header: 'Getting Started',
    type: 'Guide',
    status: 'In Progress',
    target: 'New users',
    limit: '100 views',
    reviewer: 'Jane Smith',
  },
  {
    id: 3,
    header: 'API Reference',
    type: 'Documentation',
    status: 'Done',
    target: 'Developers',
    limit: 'No limit',
    reviewer: 'Bob Johnson',
  },
  {
    id: 4,
    header: 'Best Practices',
    type: 'Guide',
    status: 'In Progress',
    target: 'All users',
    limit: '500 views',
    reviewer: 'Alice Williams',
  },
  {
    id: 5,
    header: 'Troubleshooting',
    type: 'Documentation',
    status: 'Done',
    target: 'Support team',
    limit: 'No limit',
    reviewer: 'Charlie Brown',
  },
])
</script>

<template>
  <SidebarInset>
    <SiteHeader />
    <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
      <SectionCards />
      <ChartAreaInteractive />
      <DataTable :data="tableData" />
    </div>
  </SidebarInset>
</template>

