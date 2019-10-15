console.log("UNICORNS ARE REAL!");

(function() {
    ////////// vue instance ///////////
    var hash = location.hash.slice(1);
    new Vue({
        el: "#main",
        data: {
            images: [],
            image: location.hash.slice(1),
            showModal: hash,
            title: "",
            description: "",
            username: "",
            file: null
        },

        /////// vue instance mounted ///////

        mounted: function() {
            console.log("MY VUE HAS MOUTED");
            console.log("IMAGE IS:", this.images);

            var me = this;

            axios
                .get("/images")
                .then(function(res) {
                    me.images = res.data;
                })
                .catch(function(error) {
                    console.log("ERROR IN POST /images:", error);
                });

            window.addEventListener("hashchange", function() {
                console.log("Hash Event Works");
                me.image = location.hash.slice(1);
                console.log(this.image);
            });
        },

        /////// vue instance methods ////////

        methods: {
            uploadImageButton: function(e) {
                e.preventDefault();

                var formData = new FormData();

                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

                var vueInstance = this;

                axios
                    .post("/upload", formData)
                    .then(function(res) {
                        var image = res.data;
                        console.log("IMAGE ON /upload:", image[0]);
                        vueInstance.images.unshift(image[0]);
                    })
                    .catch(function(err) {
                        console.log("ERROR IN POST /upload:", err);
                    });
            },
            handleChange: function(e) {
                console.log("handleChange is running!!!");
                console.log("file:", e.target.files[0]);
                this.file = e.target.files[0];
            },

            showModalMethod: function(id) {
                console.log("showModalMethod is running!");
                this.showModal = true;
                this.image = id;
                console.log("images:", id);
            },

            closeModalOnParent: function() {
                console.log("closeModalOnParent runs!");
                this.image = null;
            },

            showMore: function(e) {
                e.preventDefault();

                var vueInstance = this;
                console.log("showMore is running:", this.images);
                axios
                    .get("/more/" + this.images[this.images.length - 1].id)
                    .then(function(res) {
                        console.log("RES FROM /more:", res.data);

                        vueInstance.images.push(...res.data);
                        if (
                            res.data[0].lowestId ==
                            vueInstance.images[vueInstance.images.length - 1].id
                        ) {
                            vueInstance.showMore = false;
                        }
                    })
                    .catch(function(err) {
                        console.log("ERROR IN GET /more:", err);
                    });
            }
        }
    });

    /////////////// vue component /////////////////

    Vue.component("image-modal", {
        template: "#image-modal-template",
        props: ["imageid"],

        data: function() {
            return {
                image: {},
                title: "",
                url: "",
                description: "",
                username: "",

                //data for comments
                commentsData: {
                    username: "",
                    comment: "",
                    created_at: ""
                },
                //all the comments
                comments: []
            };
        },

        //////////// vue componente mounted //////////////

        mounted: function() {
            console.log("mounted runs!");
            console.log("this in component:", this.imageid);
            console.log("this:", this);
            var me = this;

            axios
                .get("/image/" + this.imageid)
                .then(function(res) {
                    console.log("res.data component:", res.data);
                    me.image = res.data[0];
                })
                .catch(function(err) {
                    console.log("ERROR IN GET /image/", err);
                });

            axios
                .get("/comments/" + this.imageid)
                .then(function(res) {
                    console.log("res.data component comments:", res.data);
                    me.comments = res.data;
                })
                .catch(function(err) {
                    console.log("ERROR IN GET /comments/:", err);
                });
        },

        ///////////// vue component methods /////////////

        watch: {
            id: function() {
                var me = this;

                axios
                    .get("/image/" + this.imageid)
                    .then(function(res) {
                        console.log("res.data component:", res.data);
                        me.image = res.data[0];
                    })
                    .catch(function(err) {
                        console.log("ERROR IN GET /image/", err);
                    });

                axios
                    .get("/comments/" + this.imageid)
                    .then(function(res) {
                        console.log("res.data component comments:", res.data);
                        me.comments = res.data;
                    })
                    .catch(function(err) {
                        console.log("ERROR IN GET /comments/:", err);
                    });
            }
        },

        methods: {
            closeModal: function() {
                console.log("closeModal runs!");
                this.$emit("close");
            },

            uploadCommentsButton: function(e) {
                e.preventDefault();

                var vueComponent = this;

                console.log("THIS.COMMENTSDATA:", this.comments);
                this.commentsData.created_at = new Date();
                axios
                    .post("/comments/" + this.imageid, this.commentsData)
                    .then(function(res) {
                        console.log(
                            "res.data methods POST from /comments/",
                            res.data
                        );

                        vueComponent.comments.unshift(
                            vueComponent.commentsData
                        );
                    })
                    .catch(function(err) {
                        console.log("ERROR IN POST /comments", err);
                    });
            }
        }
    });
})();
