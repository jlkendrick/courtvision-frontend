import { Collapse } from "react-collapse"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import "../styles/Card.css"
import { useState, useRef } from "react"
import { getLeague } from "../requests/api"

export function CardWithForm() {
  const [formData, setFormData] = useState({
    leagueid: "",
    leagueyear: "",
    teamname: "",
    s2: "",
    swid: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.id, e.target.value)
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleClear = () => {
    console.log("Cleared")
    setFormData({
      leagueid: "",
      leagueyear: "",
      teamname: "",
      s2: "",
      swid: "",
    })
  }

  const [isFormOpen, setIsFormOpen] = useState(true)

  const arrowIcon = useRef<SVGSVGElement>(null)

  const handleToggle = () => {
    setIsFormOpen(!isFormOpen)

    if (arrowIcon.current) {
      arrowIcon.current.classList.toggle('arrow-open');
    }
  }
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Find the league
    const success = await getLeague(formData.leagueid, formData.leagueyear, formData.teamname, formData.s2, formData.swid)
    if (!success) {
      handleClear()
    } else {
      handleToggle()
      console.log("Submitted")
    }

    console.log("here")

  }

  return (
    <div className="card-wrapper">

    <Card className="w-[375px]">
      <div className="margin-reducer">
        <CardHeader>
          <CardTitle>League Information</CardTitle>
          <CardDescription>Find your ESPN fantasy basketball league.</CardDescription>
        </CardHeader>
      </div>
      <CardContent>

        <Collapse isOpened={isFormOpen}>

        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">League ID<span style={{ color: 'red'}}> *</span></Label>
              <Input id="leagueid" placeholder="ID" value={formData.leagueid} onChange={handleChange}/>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">League Year<span style={{ color: 'red'}}> *</span></Label>
              <Input id="leagueyear" placeholder="Year" value={formData.leagueyear} onChange={handleChange}/>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Team Name<span style={{ color: 'red'}}> *</span></Label>
              <Input id="teamname" placeholder="Team Name" value={formData.teamname} onChange={handleChange}/>
            </div>
            <hr className="custom-hr"></hr>
            <div className="margin-reducer1">
              <CardDescription>For private leagues.</CardDescription>
            </div>
            <div className="margin-reducer2">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">ESPN s2</Label>
                <Input id="s2" placeholder="s2" value={formData.s2}onChange={handleChange}/>
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">SWID</Label>
              <Input id="swid" placeholder="SWID" value={formData.swid} onChange={handleChange}/>
            </div>
          </div>
          <div className="margin-increaser1">
            <CardFooter className="flex">
              <Button type="button" onClick={handleClear} className="border text-white bg-border shadow-sm hover:bg-accent hover:text-accent-foreground" style={{ marginLeft: "-23px" }}>Clear</Button>
              <Button type="submit" className="border text-white bg-border shadow-sm hover:bg-accent hover:text-accent-foreground" style={{ marginLeft: "138px" }}>Find</Button>
            </CardFooter>
          </div>
        </form>

        </Collapse>

        <div className="arrow-container">
        <FontAwesomeIcon icon={isFormOpen ? faChevronUp : faChevronDown} id="toggleFormButton" onClick={handleToggle} ref={arrowIcon} />
        </div>

      </CardContent>
    </Card>

    </div>
  )
}
