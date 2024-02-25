
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import "../styles/Card.css"
import { useState } from "react"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

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
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Submitted")
  }

  return (
    <div className="card-wrapper">

    <Card className="w-[350px]">
      <div className="margin-reducer">
        <CardHeader>
          <CardTitle>League Information</CardTitle>
          <CardDescription>Find your ESPN fantasy basketball league.</CardDescription>
        </CardHeader>
      </div>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">League ID<span style={{ color: 'red'}}> *</span></Label>
              <Input id="leagueid" placeholder="ID" onChange={handleChange}/>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">League Year<span style={{ color: 'red'}}> *</span></Label>
              <Input id="leagueyear" placeholder="Year" onChange={handleChange}/>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Team Name<span style={{ color: 'red'}}> *</span></Label>
              <Input id="teamname" placeholder="Team Name" onChange={handleChange}/>
            </div>
            <hr className="custom-hr"></hr>
            <div className="margin-reducer1">
              <CardDescription>For private leagues.</CardDescription>
            </div>
            <div className="margin-reducer2">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">ESPN s2</Label>
                <Input id="s2" placeholder="s2" onChange={handleChange}/>
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">SWID</Label>
              <Input id="swid" placeholder="SWID" onChange={handleChange}/>
            </div>
          </div>
          <div className="margin-increaser1">
            <CardFooter className="flex items-right">
              <Button type="submit" className="border text-white border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground" style={{ marginLeft: "auto"}}>Find Team</Button>
            </CardFooter>
          </div>
        </form>
      </CardContent>
    </Card>

    </div>
  )
}
