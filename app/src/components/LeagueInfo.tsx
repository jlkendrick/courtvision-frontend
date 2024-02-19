export default function LeagueInfo() {
	// Returns a form to input league information
	return (
		<div>
			<h2>League Information</h2>
			<form>
				<label>
					League ID:
					<input type="text" name="leagueID" />
				</label>
				<br />
				<label>
					League Year:
					<input type="text" name="leagueYear" />
				</label>
				<br />
				<label>
					Team Name:
					<input type="text" name="teamName" />
				</label>
				<br />
				<input type="submit" value="Submit" />
			</form>
		</div>
	)
}
