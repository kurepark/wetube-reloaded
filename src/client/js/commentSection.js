const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtns = document.querySelectorAll('.deleteBtn');


const addComment = (text, id) => {
    const videoComment = document.querySelector('.video__comments ul');
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    const span = document.createElement("span");
    const deleteBtn = document.createElement("span");
    deleteBtn.innerText = "❌";
    icon.className = "fas fa-comment";
    span.innerText = `${text}`;
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(deleteBtn);


    videoComment.prepend(newComment);
}

const deleteComment = (deleteTarget) => {
    deleteTarget.remove();
}

const handelDelete = async (e) => {
    const targetElement = e.target.parentElement;
    const commentId = targetElement.dataset.id;
    const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
    });

    if (response.status === 200) {
        deleteComment(targetElement);
    }

}

const handleSubmit = async (e) => {
    e.preventDefault();
    const textarea = form.querySelector("textarea");
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;

    if (text === "") {
        return
    }
    const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: { // headers = about requst infomaion
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: text }),
    });

    if (response.status === 201) {
        textarea.value = "";
        const { newCommentId } = await response.json();
        addComment(text, newCommentId);
    }
};

if (form) {
    form.addEventListener("click", handleSubmit);
    deleteBtns.forEach((elements) => {
        elements.addEventListener('click', handelDelete);
    });
}


// TODO : 내가 쓴 댓글에만 x 버튼 추가하기
// TODO : 내가 쓴 댓글 닫기 눌러서 지워버리기
// TODO : 내가 쓴 댓글에만 x 버튼 추가하기
