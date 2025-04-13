<template>
  <div v-if="modalActive" class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container" ref="target">
        <h1>Create a comment</h1>
        <textarea
          style="width: 100%"
          v-model="commentContent"
          placeholder="Write a comment"
        ></textarea>
        <div class="modal-footer">
          <div v-if="commentContent.length < 25">
            <p class="error-message">Comment is too short</p>
          </div>
          <div v-else-if="commentContent.length > 250">
            <p class="error-message">Comment is too long</p>
          </div>
          <div v-else>
            <button class="normal-button" v-if="!edit" @click.stop="createComment">Create</button>
            <button class="normal-button" v-else @click.stop="editComment">Finish</button>
          </div>
        </div>
        <!-- <p>{{ commentContent }}</p> -->
        <!-- {{ comment }} -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, toRaw, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { userState } from '@/UserData'
import axios from 'axios'

const props = defineProps({
  modalActive: Boolean,
  game: Object,
  comment: Object,
  edit: Boolean,
})

const cleanedGame = JSON.parse(JSON.stringify(toRaw(props.game)))
const emit = defineEmits(['modal-exit'])
const target = ref(null)
const commentContent = ref(props.comment.value?.comment || '')
const commentj = computed(() => props.comment?.comment !== '')
// const reactions = ref(props.comment.reactions)
const route = useRoute()
const gameId = route.params.id

onClickOutside(target, () => emit('modal-exit'))

async function createComment() {
  try {
    console.log(userState)
    console.log(commentContent.value)

    let response = await axios.post(`http://localhost:5000/game/${gameId}/comment/make`, {
      userState,
      comment: {
        comment: commentContent.value,
        likes: 0,
        dislikes: 0,
        created: Date.now(),
        edited: 0,
        comment_id: '',
        reactions: [],
      },
      game: props.game,
    })

    const gameInfo = response.data
    console.log(gameInfo)
    emit('modal-exit')
    location.reload()
  } catch (error) {
    console.error(error)
  }
}

async function editComment() {
  try {
    console.log(userState)
    console.log(commentContent.value)
    let editTime = 0
    if (props?.comment?.value?.comments[0].created !== undefined) {
      console.log('editTime')
      editTime = Date.now()
    }
    console.log(props?.comment?.value?.comments[0].created)
    console.log(props?.comment?.value?.comments[0]?.comment_id)
    console.log(editTime)
    let response = await axios.post(`http://localhost:5000/game/${gameId}/comment/edit`, {
      userState,
      comment: {
        comment: commentContent.value,
        likes: props?.comment?.value?.comments[0].likes || 0,
        dislikes: props?.comment?.value?.comments[0].dislikes || 0,
        created: props?.comment?.value?.comments[0].created || Date.now(),
        edited: editTime,
        comment_id: props?.comment?.value?.comments[0]?.comment_id,
        reactions: props?.comment?.value?.comments[0].reactions || [],
      },
      game: props.game,
    })

    const gameInfo = response.data
    console.log(gameInfo)
    emit('modal-exit')
    location.reload()
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 5px;
}
.modal-container {
  width: 75%;
  height: 50%;
  margin: 150px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}
</style>
