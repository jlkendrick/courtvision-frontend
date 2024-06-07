import { ManageTeamsTable } from "@/components/ManageTeamsComponents";

export default function ManageTeams({
  manageTeamsErrors,
  setManageTeamsErrors,
}: {
  manageTeamsErrors: {
    incorrectInfo: boolean;
    internalServerError: boolean;
  };
  setManageTeamsErrors: (manageTeamsErrors: {
    incorrectInfo: boolean;
    internalServerError: boolean;
  }) => void;

  // TODO: Pass the above props to ManageTeamsTable and make the correct toasts appear on the submission of the form

}) {
  return (
    <div>
      <ManageTeamsTable /> 
    </div>
  );
}
