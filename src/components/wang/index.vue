<template>
  <div id="wang"></div>
</template>

<script>
import wangEditor from "wangeditor";
export default {
  name: "wang",
  data() {
    return {
      hasChange: false,
      hasInit: false,
      editor: null,
      editorData: "",
    };
  },
  props: {
    value: {
      type: String,
      default: "",
    },
  },
  watch: {
    value(val) {
      // if (!this.hasChange && this.hasInit) {
      if (this.hasInit) {
        this.$nextTick(() => this.editor.txt.html(val));
      }
    },
  },
  mounted() {
    const editor = new wangEditor(`#wang`);
    editor.config.uploadImgShowBase64 = false;
    editor.config.showLinkImgHref = false;
    editor.config.uploadFileName = "file";
    editor.config.onchange = (newHtml) => {
      this.hasChange = true;
      this.$emit("input", editor.txt.html());
    };
    editor.config.uploadImgServer = "http://106.12.147.150:8080/files/upload2";
    editor.create();
    this.hasInit = true;
    this.editor = editor;
    if (this.value) {
      editor.txt.html(this.value);
    }
  },
  methods: {
    getEditorData() {
      // 通过代码获取编辑器内容
      let data = this.editor.txt.html();
      alert(data);
    },
  },
  beforeDestroy() {
    // 调用销毁 API 对当前编辑器实例进行销毁
    this.editor.destroy();
    this.editor = null;
  },
};
</script>