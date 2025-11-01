import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChallengeProps } from "./Challenges";
import ChallengeCalendar from "./ChallengeCalendar";

interface AcceptedChallengeProps {
  acceptedChallenges: ChallengeProps[];
}

const AcceptedChallenge = ({ acceptedChallenges }: AcceptedChallengeProps) => {
  return (
    <div className="flex justify-center items-center w-full py-5 mb-16 flex-col gap-5">
      {acceptedChallenges.map((ch) => (
        <div
          key={ch._id}
          className="flex flex-col justify-center items-center bg-[#1a1a1a] w-[80vw] max-w-[800px] py-5 rounded-lg"
        >
          <div className="grid grid-cols-3 place-items-center w-full">
            {/* Left */}
            <div className="flex flex-col items-center">
              <ProgressAvatar
                progress={Number(((ch.progress?.challenger?.length / ch.forDays) * 100).toFixed(1))}
                name="CN"
                image="https://github.com/shadcn.png"
              />
              <p>{ch.challenger?.name}</p>
            </div>

            {/* Middle */}
            <h3 className="font-bold text-3xl text-center">
              {ch.challengeName}
            </h3>

            {/* Right */}
            <div className="flex flex-col items-center">
            <ProgressAvatar
              progress={Number(((ch.progress?.challengee?.length / ch.forDays) * 100).toFixed(1))}
              name="CN"
              image="https://github.com/shadcn.png"
            />
            <p>{ch.challengee?.name}</p>
            </div>
          </div>

          {/* Calendar */}
          <div className="mt-6">
            <ChallengeCalendar
              challengerDates={ch.progress.challenger}
              challengeeDates={ch.progress.challengee}
              startDate={ch.startDate.split("T")[0]}
              endDate={ch.endDate.split("T")[0]}
              id={ch._id}
              challengerName={ch.challenger.name}
              challengeeName={ch.challengee.name}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AcceptedChallenge;

// Avatar with circular gradient
const ProgressAvatar = ({
  progress,
  image,
  name,
}: {
  progress: number;
  image: string;
  name: string;
}) => {
  const background = `conic-gradient(#e7000b ${progress * 3.6}deg, #333 0deg)`;

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center p-[3px]"
        style={{ background }}
      >
        <Avatar className="w-12 h-12 border-2 border-[#1a1a1a]">
          <AvatarImage src={image} />
          <AvatarFallback>{name}</AvatarFallback>
        </Avatar>
      </div>
      <p className="text-sm mt-1 text-gray-300">{progress}%</p>
    </div>
  );
};
