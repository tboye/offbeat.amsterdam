<template>
    <article class='h-event b-1 border-1' itemscope itemtype="https://schema.org/Event">
        <nuxt-link :to='`/event/${event.slug || event.id}`' itemprop="url">
            <!-- <nuxt-picture/> -->
             
            <CoreImg v-if='!hide_thumbs' :event='event' thumb :lazy='lazy' />
            <!-- <v-icon class='float-right mr-1' v-if='event.parentId' color='success' icon='mdi-repeat' /> -->
            <h1 class='title p-name' itemprop="name">{{ event.title }}</h1>
        </nuxt-link>
        
        <!-- <v-img contain v-if='event?.ap_user?.image' :src='event?.ap_user?.image' max-height=30  max-width=30 style="position: absolute; top: 5px; right: 5px;" /> -->
        
        <v-card-text class='body pt-0 pb-0'>
            <time class="dt-start subtitle-1" :datetime="$formatter.time(event)" itemprop="startDate" :content="$formatter.timeToISO(event.start_datetime)">{{$formatter.time(event.start_datetime)}}</time>
            <!-- <time class='dt-start subtitle-1' :datetime='$time.unixFormat(event.start_datetime, "yyyy-MM-dd HH:mm")'
                itemprop="startDate" :content="$time.unixFormat(event.start_datetime, 'yyyy-MM-dd\'T\'HH:mm')"> <v-icon v-text='mdiCalendar' /> {{ $time.when(event) }}
            </time>
            <time class='d-none dt-end' v-if='event.end_datetime' itemprop="endDate"
                :content="$time.unixFormat(event.end_datetime,'yyyy-MM-dd\'T\'HH:mm')"> {{ $time.unixFormat(event.end_datetime)}}</time> -->
        
            <nuxt-link class='place d-block p-location pl-0' text
                :to='`/place/${encodeURIComponent(event.place.name)}`'
                itemprop="location" itemscope itemtype="https://schema.org/Place">
                <v-icon icon="mdi-map-marker"/>
                <span itemprop='name'>ciao {{ event.place.name }}</span>
            </nuxt-link>
            <div class='d-none' itemprop='address'>{{ event.place.address }}</div>
    
        </v-card-text>

        <v-card-actions class='flex-wrap'>
            <v-chip class='ml-1 mt-1' v-for='tag in event?.tags?.slice(0, 6)' small label :to='`/tag/${encodeURIComponent(tag)}`'
                :key='tag' outlined color='primary'>{{ tag }}</v-chip>
        </v-card-actions>

    </article>
</template>
<script setup lang="ts">

defineProps({
    event: { type: Object, default: () => ({})},
    lazy: { type: Boolean, default: false },
    hide_thumbs: { type: Boolean, default: false }
})

</script>
