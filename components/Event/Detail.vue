<script setup lang="ts">
defineProps({ event: { type: Object, default: () => ({})} })
</script>
<template>
    <v-card outlined>
        <v-container class="eventDetails">
            <!-- v-icon.float-right(v-if='event.parentId' color='success' v-text='mdiRepeat') -->
            <!-- <time datetime="" class="dt-start"></time> (:datetime='$time.unixFormat(event.start_datetime, "yyyy-MM-dd HH:mm")' itemprop="startDate" :content='$time.unixFormat(event.start_datetime, "yyyy-MM-dd\'T\'HH:mm")') -->
            <span class="ml-2 text-uppercase">{{ $formatter.time(event.start_datetime) }}</span>

            <div class="p-location h-adr" itemprop="location" itemscope itemtype="https://schema.org/Place">
                <v-icon icon="mdi-calendar"/>
                <nuxt-link class="vcard ml-2 p-name text-decoration-none text-uppercase" :to='`/place/${encodeURIComponent(event?.place?.name)}`'>
                    <span itemprop='name'>{{event?.place?.name}}</span>
                    <div class="font-weight-light p-street-address" v-if='event?.place?.name !=="online"' itemprop='address'>{{event?.place?.address}}</div>
                    </nuxt-link>
            </div>

            <!-- //- tags, hashtags -->
            <v-container class="pt-0" v-if='event?.tags?.length'>
                <v-chip class="p-category ml-1 mt-1" v-for='tag in event.tags' small label color='primary' outlined :key='tag' :to='`/tag/${encodeURIComponent(tag)}`'>{{tag}}</v-chip>
            </v-container>


            <!-- online -->
            <v-list nav density="compact">
                <v-list-item v-for="(item, index) in event.online_locations" target="_blank" :href="item" :key="index">
                    <v-list-item-icon><v-icon icon='mdi-monitor-account'/></v-list-item-icon>
                    <!-- <v-list-item-content class="py-0"> -->
                    <v-list-item-title class="text-caption" v-text="item" />
                    <!-- </v-list-item-content> -->
                </v-list-item>
            </v-list>
            <!-- v-list(nav dense v-if='hasOnlineLocations')
v-list-item(v-for='(item, index) in event.online_locations' target='_blank' :href="`${item}`" :key="index")
v-list-item-icon
v-icon(v-text='mdiMonitorAccount')
v-list-item-content.py-0
v-list-item-title.text-caption(v-text='item') -->

        </v-container>
    </v-card>
</template>
    <!-- v-card(outlined)
    v-icon(v-text='mdiCalendar' small)
    .d-none.dt-end(v-if='event.end_datetime' itemprop="endDate" :content='$time.unixFormat(event.end_datetime,"yyyy-MM-dd\'T\'HH:mm")') {{$time.unixFormat(event.end_datetime,"yyyy-MM-dd'T'HH:mm")}}
  div.font-weight-light.mb-3 {{$time.from(event.start_datetime)}}
    small(v-if='event.parentId')  ({{$time.recurrentDetail(event)}})

  .p-location.h-adr(itemprop="location" itemscope itemtype="https://schema.org/Place")
    v-icon(v-text='mdiMapMarker' small)
    nuxt-link.vcard.ml-2.p-name.text-decoration-none.text-uppercase(:to='`/place/${encodeURIComponent(event?.place?.name)}`') 
      span(itemprop='name') {{event?.place?.name}}
      .font-weight-light.p-street-address(v-if='event?.place?.name !=="online"' itemprop='address') {{event?.place?.address}}
      
      //- a.d-block(v-if='event.ap_object?.url' :href="event.ap_object?.url") {{ event.ap_object?.url }}
      a(v-if='event?.original_url'  :href="event?.original_url") {{event.original_url}}

//- tags, hashtags
v-container.pt-0(v-if='event?.tags?.length')
v-chip.p-category.ml-1.mt-1(v-for='tag in event.tags' small label color='primary'
outlined :key='tag' :to='`/tag/${encodeURIComponent(tag)}`') {{tag}}

//- online events
v-list(nav dense v-if='hasOnlineLocations')
v-list-item(v-for='(item, index) in event.online_locations' target='_blank' :href="`${item}`" :key="index")
v-list-item-icon
v-icon(v-text='mdiMonitorAccount')
v-list-item-content.py-0
v-list-item-title.text-caption(v-text='item') -->
