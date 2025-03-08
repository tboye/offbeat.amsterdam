<template lang='pug'>
v-container
  v-card-title {{$t('admin.unconfirmed_events')}}
  v-card-subtitle {{$t('admin.event_confirm_description')}}
  v-data-table(
    v-if='unconfirmedEvents.length'
    :hide-default-footer='unconfirmedEvents.length<10'
    :header-props='{ sortIcon: mdiChevronDown }'
    :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
    :items='unconfirmedEvents'
    :headers='headers')
    template(v-slot:item.start_datetime='{ item }') {{$time.when(item)}}
    template(v-slot:item.actions='{ item }')
      t-btn(@click='confirm(item)' color='success' :tooltip="$t('common.confirm')")
        v-icon(v-text='mdiCheckBold')
      t-btn(:to='`/event/${item.slug || item.id}`' color='info' :tooltip="$t('common.preview')")
        v-icon(v-text='mdiEye')
      t-btn(:to='`/add/${item.id}`' color='warning' :tooltip="$t('common.edit')")
        v-icon(v-text='mdiPencil')
      t-btn(@click='remove(item)' color='error' :tooltip="$t('common.delete')")
        v-icon(v-text='mdiDeleteForever') 

  v-card-title {{$t('common.past_events')}}
  v-data-table(
    v-if='unconfirmedOldEvents.length'
    :hide-default-footer='unconfirmedOldEvents.length<10'
    :header-props='{ sortIcon: mdiChevronDown }'
    :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
    :items='unconfirmedOldEvents'
    :headers='headers')
    template(v-slot:item.start_datetime='{ item }') {{$time.when(item)}}
    template(v-slot:item.actions='{ item }')
      template
        t-btn(:to='`/event/${item.slug || item.id}`' color='info' :tooltip="$t('common.preview')")
          v-icon(v-text='mdiArrowRight')
        t-btn(:to='`/add/${item.id}`' color='warning' :tooltip="$t('common.edit')")
          v-icon(v-text='mdiPencil')
        t-btn(@click='remove(item)' color='error' :tooltip="$t('common.delete')")
          v-icon(v-text='mdiDeleteForever')
</template>
<script>
import { mdiChevronLeft, mdiChevronRight, mdiChevronDown, mdiDeleteForever, mdiPencil, mdiEye, mdiEyeOff, mdiCheckBold, mdiArrowRight } from '@mdi/js'
import TBtn from '../../components/TBtn.vue'

export default {
  props: {
    unconfirmedEvents: { type: Array, default: () => [] },
    unconfirmedOldEvents: { type: Array, default: () => [] },
  },
  components: { TBtn },
  data () {
    return {
      mdiChevronLeft, mdiChevronRight, mdiChevronDown, mdiDeleteForever, mdiPencil, mdiEye, mdiEyeOff, mdiCheckBold, mdiArrowRight,
      valid: false,
      dialog: false,
      editing: false,
      headers: [
        { value: 'title', text: this.$t('common.title') },
        { value: 'place.name', text: this.$t('common.place'), width: 300 },
        { value: 'start_datetime', text: this.$t('common.when'), width: 300 },
        { value: 'actions', text: this.$t('common.actions'), align: 'right', sortable: false, width: 180 }
      ]
    }
  },
  methods: {
    edit (event) {
      this.$router.push(`/add/${event.id}`)
    },
    async confirm (event) {
      try {
        await this.$axios.$put(`/event/confirm/${event.id}`)
        this.$emit('confirmed', event.id)
        this.$root.$message('event.confirmed', { color: 'success' })
      } catch (e) {}
    },
    async remove (event) {
      const ret = await this.$root.$confirm('event.remove_confirmation', { event: event.title })
      if (!ret) { return }
      try {
        await this.$axios.delete(`/event/${event.id}`)
        this.$root.$message('admin.event_remove_ok')
        this.$emit('removed', event.id)
      } catch (e) {}
    }
  }
}
</script>
