function RecipeComments({ recipeId, comments, onAddComment, readOnly = false }) {
    const [userComment, setUserComment] = useState('');
    const [rating, setRating] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userComment && rating > 0 && !readOnly) {
            onAddComment(recipeId, { text: userComment, rating, user: "Anonymous" });
            setUserComment('');
            setRating(0);
        }
    };

    return (
        <div className="comments-section">
            <h5>Comments</h5>
            <ul>
                {comments.map((c, idx) => (
                    <li key={idx}>
                        <strong>{c.user}</strong>: {c.text} - {c.rating} ⭐
                    </li>
                ))}
            </ul>

            {!readOnly && (
                <form onSubmit={handleSubmit}>
                    <textarea 
                        value={userComment} 
                        onChange={(e) => setUserComment(e.target.value)} 
                        placeholder="Write a comment..." 
                        required
                    />
                    <select value={rating} onChange={(e) => setRating(Number(e.target.value))} required>
                        <option value={0}>Rate</option>
                        <option value={1}>1 ⭐</option>
                        <option value={2}>2 ⭐</option>
                        <option value={3}>3 ⭐</option>
                        <option value={4}>4 ⭐</option>
                        <option value={5}>5 ⭐</option>
                    </select>
                    <button type="submit">Add Comment</button>
                </form>
            )}
        </div>
    );
}
