from django.shortcuts import get_object_or_404
from django.db.models import QuerySet
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from .models import StudyUser, Task, Pet  # TODO remove, should be serializer
from .serializers import TaskSerializer

@api_view(["GET"])
def ping(_request: Request) -> Response:
    print(type(StudyUser))
    return Response("pong")

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_task(request: Request) -> Response:
    serializer = TaskSerializer(data=request.data, context={"request": request})

    if serializer.is_valid():
        # save and return
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_task(request: Request) -> Response:
    # look up user and react accordingly if they don't exist
    try:
        if not request.user.is_active:
            return Response(status=status.HTTP_403_FORBIDDEN)

        tasks: QuerySet[Task] = Task.objects.filter(user=request.user)
        serializer = TaskSerializer(tasks, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    except StudyUser.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(["POST"])
def complete_task(request: Request, task_id: int) -> Response:
    user = StudyUser.objects.first()

    if not user:
        return Response(
            {"error": "No demo user found."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    task = get_object_or_404(
        Task,
        id=task_id,
        user=user,
    )

    if task.is_completed:
        return Response(
            {"error": "Task is already completed!"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    task.is_completed = True

    reward_amount = task.reward
    user.money += reward_amount

    pet = Pet.objects.filter(owner=user).first()
    pet_hp = None

    if pet:
        pet.hp = min(pet.hp + 10, 100)
        pet.save()
        pet_hp = pet.hp

    task.save()
    user.save()

    return Response(
        {
            "message": "Task completed successfully!",
            "reward_earned": reward_amount,
            "new_balance": user.money,
            "pet_hp": pet_hp,
        },
        status=status.HTTP_200_OK,
    )
